export type Button = {
  text: string;
  callback_data: string;
};

export const getManyButtons = (buttons: Button[], perRow = 4): Button[][] => {
  const result: Button[][] = [];
  for (let i = 0; i < buttons.length; i += perRow) {
    result.push(buttons.slice(i, i + perRow));
  }
  return result;
};

export const validateNumber = (value: string) => {
  const normalized = value.replace(',', '.').trim();
  return /^-?\d+(\.\d+)?$/.test(normalized);
};