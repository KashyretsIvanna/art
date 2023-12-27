import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function validateConfig(Expected: new () => any) {
  return (config: Record<string, unknown> = {}) => {
    const validatedConf = plainToInstance(Expected, config, {
      exposeDefaultValues: true,
    });
    const errors = validateSync(validatedConf);

    if (errors.length) throw new Error(errors.toString());

    return validatedConf;
  };
}
