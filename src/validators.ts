export function parseUUID(uuid: any): string {
  if (typeof uuid !== 'string') {
    throw new Error(`Invalid UUID type ${typeof uuid}. Expected string.`);
  }
  uuid = uuid.toLowerCase();
  const is128BitUuid = uuid.search(/^[0-9a-f]{8}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{12}$/) >= 0;
  if (!is128BitUuid) {
    throw new Error(
      `Invalid UUID format ${uuid}. Expected 128 bit string (e.g. "0000180d-0000-1000-8000-00805f9b34fb").`
    );
  }
  return uuid;
}
