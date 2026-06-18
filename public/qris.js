(function (root) {
  function parse(payload) {
    const fields = [];
    let cursor = 0;
    while (cursor + 4 <= payload.length) {
      const id = payload.slice(cursor, cursor + 2);
      const length = Number(payload.slice(cursor + 2, cursor + 4));
      const value = payload.slice(cursor + 4, cursor + 4 + length);
      if (!/^\d{2}$/.test(id) || !Number.isInteger(length) || value.length !== length) throw new Error('Payload QRIS tidak valid');
      fields.push({ id, value });
      cursor += 4 + length;
    }
    if (cursor !== payload.length) throw new Error('Panjang payload QRIS tidak valid');
    return fields;
  }

  function crc16(text) {
    let crc = 0xffff;
    for (let index = 0; index < text.length; index += 1) {
      crc ^= text.charCodeAt(index) << 8;
      for (let bit = 0; bit < 8; bit += 1) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
    return crc.toString(16).toUpperCase().padStart(4, '0');
  }

  function dynamic(payload, amount) {
    const rounded = Math.round(Number(amount));
    if (!Number.isFinite(rounded) || rounded < 1) throw new Error('Nominal pembayaran tidak valid');
    const fields = parse(payload).filter((field) => field.id !== '54' && field.id !== '63');
    const point = fields.find((field) => field.id === '01');
    if (point) point.value = '12';
    else fields.splice(1, 0, { id: '01', value: '12' });
    const amountField = { id: '54', value: String(rounded) };
    const countryIndex = fields.findIndex((field) => field.id === '58');
    fields.splice(countryIndex >= 0 ? countryIndex : fields.length, 0, amountField);
    const body = fields.map((field) => `${field.id}${String(field.value.length).padStart(2, '0')}${field.value}`).join('');
    const withCrcHeader = `${body}6304`;
    return withCrcHeader + crc16(withCrcHeader);
  }

  const api = { parse, crc16, dynamic };
  root.QrisTools = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
