export function convertToPlainObject(data) {
  if (!data) return data;

  if (Array.isArray(data)) {
    return data.map((item) => convertToPlainObject(item));
  }

  if (typeof data === "object") {
    // Convertir les Timestamps Firebase
    if (data.toDate && typeof data.toDate === "function") {
      return {
        seconds: data.seconds,
        nanoseconds: data.nanoseconds,
        iso: data.toDate().toISOString(),
      };
    }

    // Convertir les objets normaux
    const result = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = convertToPlainObject(value);
    }
    return result;
  }

  return data;
}
