const config = process.env;

export type IConfigReader = {
  get(key: string): string | undefined;

  getOrDefault(key: string, defaultValue: string): string;

  getOrError(key: string): string;
};

export function readConfig(reader: Record<string, any>): IConfigReader {
  return {
    get: (key: string): string | undefined => {
      return reader[key];
    },
    getOrDefault: (key: string, defaultValue: string): string => {
      return reader[key] || defaultValue;
    },

    getOrError: (key: string) => {
      const value = reader[key];
      if (value === undefined) {
        throw new Error(`Configuration key "${key}" is not set`);
      }
      return value;
    },
  };
}
