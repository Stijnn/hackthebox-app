interface IKeyValue {
  key: string;
  value: any;
}

type TKeyValue = IKeyValue;

/**
 * Builder for Parameter strings.
 */
export class ParamsBuilder {
  private _params: TKeyValue[];

  private constructor(initialParams?: TKeyValue[]) {
    this._params = initialParams ?? [];
  }

  /**
   * Build a string from KV pairs using `.toString()`.
   *
   * @param encode Encodes keys and values using encodeURIComponent when set to `true`.
   *
   * @example
   * ParamsBuilder.new().addParam("key", "value").build();
   * returns "key=value&"
   *
   * @returns A string based on given KeyValue pairs.
   */
  public build({ encode }: { encode?: boolean }) {
    if (encode === undefined || encode === false) {
      return this._params.map((kv) => `${kv.key}=${kv.value}`).join("&");
    }

    return this._params
      .map(
        (kv) => `${encodeURIComponent(kv.key)}=${encodeURIComponent(kv.value)}`
      )
      .join("&");
  }

  public addParam(key: string, value: any) {
    this._params.push({
      key,
      value,
    });
    return this;
  }

  /**
   * Adds the KV when value is not null or undefined.
   *
   * @param key Name of the property
   * @param value Value of the property (Nullable)
   * @returns ParamsBuilder instance
   */
  public addNullableParam(key: string, value?: any) {
    if (!value) {
      return this;
    }

    this._params.push({
      key,
      value,
    });
    return this;
  }

  public addArray(key: string, value: any[]) {
    value.forEach((v) => this.addNullableParam(key, v));
    return this;
  }

  public addNullableArray(key: string, value?: any[]) {
    if (!value) {
      return this;
    }

    return this.addArray(key, value);
  }

  /**
   * Creates a new builder.
   *
   * @returns A new builder instance.
   */
  public static new() {
    return new ParamsBuilder([]);
  }

  /**
   * Creates a builder from a given builder instance.
   *
   * @param builder A existing instance
   * @returns A new builder from existing builder instance
   */
  public static fromBuilder(builder: ParamsBuilder) {
    return new ParamsBuilder([...builder._params]);
  }

  /**
   * Creates a builder from a given array.
   *
   * @param init A array of KeyValue's used to setup the builder.
   * @returns A new builder from a given Array of KeyValue's.
   */
  public static fromKeyValue(init: TKeyValue[]) {
    return new ParamsBuilder([...init]);
  }
}
