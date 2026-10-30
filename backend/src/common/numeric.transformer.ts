// MySQL trả DECIMAL dạng chuỗi; chuyển về number để API trả đúng kiểu.
export const numericTransformer = {
  to: (value: number) => value,
  from: (value: string | null) => (value === null || value === undefined ? value : parseFloat(value)),
};
