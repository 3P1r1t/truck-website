export class EnvValidationError extends Error {
  missing: string[];
  context: string;

  constructor(context: string, missing: string[]) {
    super(`Missing required environment variables for ${context}: ${missing.join(", ")}`);
    this.name = "EnvValidationError";
    this.context = context;
    this.missing = missing;
  }
}

export function getRequiredEnvMap(
  names: string[],
  context: string
): Record<string, string> {
  const missing: string[] = [];
  const resolved = names.reduce<Record<string, string>>((acc, name) => {
    const value = process.env[name]?.trim();
    if (!value) {
      missing.push(name);
      return acc;
    }
    acc[name] = value;
    return acc;
  }, {});

  if (missing.length > 0) {
    throw new EnvValidationError(context, missing);
  }

  return resolved;
}
