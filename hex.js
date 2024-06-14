function decimalToHex(decimal) {
  if (decimal < 0) {
    return '-' + Math.abs(decimal).toString(16).padStart(2, '0');
  }
  return decimal.toString(16).padStart(2, '0');
}

 function formatSensorString(address){
  const protocolId = 0x9b; // Assuming fixed value
  const packetId = 0x01;   // Assuming fixed value

  const hexAddress = decimalToHex(address);
  const checksum = calculateChecksum(protocolId, packetId, address);

  return `7e ${decimalToHex(protocolId)} ${decimalToHex(packetId)} ${hexAddress} ${checksum} 7e`;
}

function calculateChecksum(protocolId, packetId, address) {
  const sum = protocolId ^ packetId ^ address;
  return decimalToHex(sum);
}


console.log(formatSensorString(26)); // Должно вывести: "9b 01 0a <checksum>"
console.log(formatSensorString(255)); // Должно вывести: "9b 01 ff <checksum>"
console.log(formatSensorString(0)); // Должно вывести: "9b 01 01 <checksum>"