const {
  datatypes,
  customNetFollowStateMetadata,
  customEstimatedStateMetadata,
  entityStateMetadata,
  desiredControlMetadata,
  lowLevelControlManeuverMetadata,
  desiredHeadingMetadata,
  desiredZMetadata,
  customGoToMetadata,
  netFollowMetadata,
  customCameraMessageMetadata,
  setServoPositionMetadata,
  estimatedStateMetadata,
  messages,
} = require('./IMCMetadata');

const { HEADER_LENGTH, FOOTER_LENGTH } = require('./constants');
const {
  uIntBEToBitfield,
  encodeAqueousHeader,
  decodeHeader,
  encodeImcMessage,
  getBufferWithFooterAppended,
  getIdBuffer,
} = require('./utils');

const encode = {
  customEstimatedState: encodeCustomEstimatedState,
  entityState: encodeEntityState,
  desiredControl: encodeDesiredControl,
  lowLevelControlManeuver: {
    desiredHeading: encodeLowLevelControlManeuverDesiredHeading,
    desiredZ: encodeLowLevelControlManeuverDesiredZ,
  },
  customGoTo: encodeCustomGoTo,
  netFollow: encodeNetFollow,
  customNetFollow: encodeCustomNetFollowState,
  customCameraMessage: encodeCustomCameraMessage,
  setServoPosition: encodeSetServoPosition,
  combine: Buffer.concat,
};

/**
 * Encodes and IMC message with header and footer to a `Buffer`.
 * The buffer will be of length of the encoded message (i.e. no values will be padded).
 *
 * Combining several messages and padding must be made with the `encode.combine` function.
 *
 * @param {{[key: string]: number | {[key: string]: boolean}}} imcMessage IMC message to encode
 * @param {Object} imcMessageMetadata Metadata of message to encode
 *
 * @returns {Buffer} Buffer
 */
function encodeImcPackage(imcMessage, imcMessageMetadata) {
  let dataBuf = encodeImcMessage(imcMessage, imcMessageMetadata);
  let headerBuf = encodeAqueousHeader(
    imcMessageMetadata.id.value,
    dataBuf.length,
  );
  let resultBuf = Buffer.concat([headerBuf, dataBuf]);
  return getBufferWithFooterAppended(resultBuf);
}

/**
 * Since a Low LevelControl Maneuver message encapsulates other messages it has to be handeled differently.
 *
 * @param {{[key: string]: number | {[key: string]: boolean}}} controlManeuver Values of message
 * @param {Object} controlManeuverMetadata Metadata of message to encode
 * @param {number} duration Duration of control maneuver
 *
 * @returns {Buffer} Buffer of encoded IMC message
 */
function encodeLowLevelControlManeuver(
  controlManeuver,
  controlManeuverMetadata,
  duration,
  custom = 0,
) {
  let controlManeuverId = getIdBuffer(controlManeuverMetadata.id.value);
  let controlBuf = encodeImcMessage(controlManeuver, controlManeuverMetadata);

  // Add duration
  let durationBuf = Buffer.alloc(2);
  durationBuf.writeInt16BE(duration, 0);

  // Add custom setting
  let customBuf = Buffer.alloc(2);
  durationBuf.writeInt16BE(custom, 0);

  let resultBuf = Buffer.concat([controlManeuverId, controlBuf, durationBuf, customBuf]);

  // Add header
  let headerBuf = encodeAqueousHeader(
    lowLevelControlManeuverMetadata.id.value,
    resultBuf.length,
  );
  resultBuf = Buffer.concat([headerBuf, resultBuf]);

  return getBufferWithFooterAppended(resultBuf);
}

/**
 * Main entry point for decoding buffer containing and IMC message package (including header and buffer).
 *
 * This function will decode possiblely multiple messages as long as they are concatinated without spacing.
 * It will handle padding of the buffer as long as the padding consist of zeros.
 * @param {Buffer} buf Buffer to decode
 * @param {boolean} bigEndian true -> BE, false -> LE
 *
 * @returns {{[key: string]: Object}} Object with IMC message as key (use `messages` to recieve the messages)
 */
function decode(buf, bigEndian = false) {
  console.log("Decoding the buf");
  let result = {};
  let offset = 0;
  let msg, name;
  do {
    // No more messages
    if (bigEndian){
      if (buf.readUInt16BE(offset) === 0) break;
    }
    else {
      if (buf.readUInt16LE(offset) === 0) break;
    }
    [msg, offset, name] = decodeImcMessage(buf, offset, bigEndian);
    // Add two bytes for footer
    offset += 2;
    result[name] = msg;
  } while (offset + HEADER_LENGTH + FOOTER_LENGTH < buf.length);
  return result;
}

function decodeImcMessage(buf, offset = 0, bigEndian, name = '', hasHeader = true) {
  let result = {};
  let id;

  // Get information from id
  if (hasHeader) {
    const header = decodeHeader(buf, offset, bigEndian);
    id = header.mgid;
    if (id != 350) {
      console.log("Header:");
      console.log(header);
      
    }
    offset += HEADER_LENGTH;
  } else {
    if (bigEndian) {
      id = buf.readUInt16BE(offset);
    }
    else {
      id = buf.readUInt16LE(offset);
    }
    offset += 2;
  }
  
  const imcMessageMetadata = idToMessageMetadata[id];
  if (name) name += '.';
  name += imcMessageMetadata.name;

  imcMessageMetadata.message.map(imcEntity => {
    if (!Object.prototype.hasOwnProperty.call(imcEntity, 'value')) {
      switch (imcEntity.datatype) {
        case datatypes.uint_8t:
          if (bigEndian) {
            result[imcEntity.name] = buf.readUIntBE(
              offset,
              datatypes.uint_8t.length,
            );
          }
          else {
            result[imcEntity.name] = buf.readUIntLE(
            offset,
            datatypes.uint_8t.length,);
          }
          break;
        case datatypes.uint_16t:
          if (bigEndian) {
            result[imcEntity.name] = buf.readUInt16BE(offset);
          }
          else {
            result[imcEntity.name] = buf.readUInt16LE(offset);
          }
          break;
        case datatypes.uint_32t:
          if (bigEndian) {
            result[imcEntity.name] = buf.readUInt32BE(offset);
          }
          else {
            result[imcEntity.name] = buf.readUInt32LE(offset);
          }
          break;
        case datatypes.fp32_t:
          if (bigEndian) {
            result[imcEntity.name] = buf.readFloatBE(offset);
          }
          else {
            result[imcEntity.name] = buf.readFloatLE(offset);
          }
          break;
        case datatypes.fp64_t:
          if (bigEndian) {
            result[imcEntity.name] = buf.readDoubleBE(offset);
          }
          else {
            result[imcEntity.name] = buf.readDoubleLE(offset);
          }
          break;
        case datatypes.bitfield:
          if (bigEndian) {
            result[imcEntity.name] = uIntBEToBitfield(
              buf.readUIntBE(offset, datatypes.bitfield.length),
              imcEntity.fields,
            );
          }
          else {
            result[imcEntity.name] = uIntBEToBitfield(
              buf.readUIntLE(offset, datatypes.bitfield.length),
              imcEntity.fields,
            );
          }
          break;
        case datatypes.recursive:
          [result[imcEntity.name], offset, name] = decodeImcMessage(
            buf,
            offset,
            bigEndian,
            name,
            false,
          );
          break;
        default:
          break;
      }
    }
    if (imcEntity.datatype !== datatypes.recursive) {
      offset += imcEntity.datatype.length;
    }
  });
  return [result, offset, name];
}

function encodeCustomEstimatedState(estimatedState) {
  return encodeImcPackage(estimatedState, customEstimatedStateMetadata);
}

function encodeEntityState(entityState) {
  return encodeImcPackage(entityState, entityStateMetadata);
}

function encodeDesiredControl(desiredControl) {
  return encodeImcPackage(desiredControl, desiredControlMetadata);
}

function encodeLowLevelControlManeuverDesiredHeading(desiredHeading, duration) {
  return encodeLowLevelControlManeuver(
    desiredHeading,
    desiredHeadingMetadata,
    duration,
  );
}

function encodeLowLevelControlManeuverDesiredZ(desiredZ, duration) {
  return encodeLowLevelControlManeuver(desiredZ, desiredZMetadata, duration);
}

function encodeCustomGoTo(goTo) {
  return encodeImcPackage(goTo, customGoToMetadata);
}

function encodeNetFollow(netFollow) {
  return encodeImcPackage(netFollow, netFollowMetadata);
}

function encodeCustomNetFollowState(customNetFollowState) {
  return encodeImcPackage(customNetFollowState, customNetFollowStateMetadata);
}

function encodeCustomCameraMessage(cameraMessage) {
  return encodeImcPackage(cameraMessage, customCameraMessageMetadata);
}

function encodeSetServoPosition(servoPosition) {
  return encodeImcPackage(servoPosition, setServoPositionMetadata);
}

const idToMessageMetadata = {
  1003: customEstimatedStateMetadata,
  1: entityStateMetadata,
  407: desiredControlMetadata,
  400: desiredHeadingMetadata,
  401: desiredZMetadata,
  455: lowLevelControlManeuverMetadata,
  1004: customGoToMetadata,
  1007: netFollowMetadata,
  1002: customNetFollowStateMetadata,
  1005: customCameraMessageMetadata,
  302: setServoPositionMetadata,
  // Messages added for communication with DUNE
  350: estimatedStateMetadata,
};

module.exports = { encode, decode, messages };
