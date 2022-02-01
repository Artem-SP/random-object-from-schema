const schema = {
  $schema: "http://json-schema.org/draft-07/schema#",
  definitions: {
    attendees: {
      type: "object",
      $id: "#attendees",
      properties: {
        userId: {
          type: "integer"
        },
        access: {
          enum: ["view", "modify", "sign", "execute"]
        },
        formAccess: {
          enum: ["view", "execute", "execute_view"]
        }
      },
      required: ["userId", "access"]
    }
  },
  type: "object",
  properties: {
    id: {
      anyOf: [
        {
          type: "string"
        },
        {
          type: "integer"
        }
      ]
    },
    title: {
      type: "string"
    },
    description: {
      type: "string"
    },
    startDate: {
      type: "integer"
    },
    endDate: {
      type: "integer"
    },
    attendees: {
      type: "array",
      items: {
        $ref: "#attendees"
      },
      default: []
    },
    parentId: {
      anyOf: [
        {
          type: "null"
        },
        {
          type: "string"
        },
        {
          type: "integer"
        }
      ]
    },
    locationId: {
      anyOf: [
        {
          type: "null"
        },
        {
          type: "integer"
        }
      ]
    },
    process: {
      anyOf: [
        {
          type: "null"
        },
        {
          type: "string",
          format: "regex",
          pattern:
            "https:\\/\\/[a-z]+\\.corezoid\\.com\\/api\\/1\\/json\\/public\\/[0-9]+\\/[0-9a-zA-Z]+"
        }
      ]
    },
    readOnly: {
      type: "boolean"
    },
    priorProbability: {
      anyOf: [
        {
          type: "null"
        },
        {
          type: "integer",
          minimum: 0,
          maximum: 100
        }
      ]
    },
    channelId: {
      anyOf: [
        {
          type: "null"
        },
        {
          type: "integer"
        }
      ]
    },
    externalId: {
      anyOf: [
        {
          type: "null"
        },
        {
          type: "string"
        }
      ]
    },
    tags: {
      type: "array"
    },
    form: {
      type: "object",
      properties: {
        id: {
          type: "integer"
        },
        viewModel: {
          type: "object"
        }
      },
      required: ["id"]
    },
    formValue: {
      type: "object"
    }
  },
  required: ["id", "title", "description", "startDate", "endDate", "attendees"]
};

const parseValue = (val) => {
  let newObjConstr = {}; // endpoint object declaration

  //  random data generation functions
  const getRandomIntInclusive = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //Максимум и минимум включаются
  };
  const randomStting = () => (Math.random() + 1).toString(36).substring(7);
  const randomInteger = () => getRandomIntInclusive(1, 31);
  const randomBoolean = () => {
    const booleanVal = [true, false];
    return Math.floor(Math.random() * booleanVal.length);
  };
  const stringByPattern = () => {
    const leters = randomStting();
    const leters2 = randomStting();
    const numbers = (Math.random() + 1).toString(10).substring(7);
    return `https:\\/\\/${leters}\\.corezoid\\.com\\/api\\/1\\/json\\/public\\/${numbers}\\/${leters2}`;
  };

  // random data generation call
  const parsePrimitive = (type) => {
    switch (type) {
      case "string":
        return randomStting();

      case "integer":
        return randomInteger(0, 100);

      case "boolean":
        return randomBoolean();
      default:
        return null;
    }
  };

  // random data generation for type 'anyOf'
  const parseArray = (arr) => {
    const randomObj = arr[Math.floor(Math.random() * arr.length)];
    if (randomObj.hasOwnProperty("pattern")) {
      return stringByPattern();
    } else {
      return parsePrimitive(randomObj.type);
    }
  };

  // random data generation for type 'enum'
  const parseEnum = (arr) => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  for (let key in val.properties) {
    if (val.properties[key].type === "string" || "boolean") {
      parsePrimitive(val.properties[key].type);
      newObjConstr = {
        ...newObjConstr,
        [key]: parsePrimitive(val.properties[key].type)
      };
    }

    if (val.properties[key].type === "integer") {
      if (key === "startDate") {
        newObjConstr = {
          ...newObjConstr,
          [key]: getRandomIntInclusive(1, 30)
        };
      }
      if (key === "endDate") {
        newObjConstr = {
          ...newObjConstr,
          [key]: getRandomIntInclusive(newObjConstr.startDate, 31)
        };
      } else {
        parsePrimitive("integer");
        newObjConstr = {
          ...newObjConstr,
          [key]: parsePrimitive(val.properties[key].type)
        };
      }
    }

    if (val.properties[key].hasOwnProperty("anyOf")) {
      newObjConstr = {
        ...newObjConstr,
        [key]: parseArray(val.properties[key].anyOf)
      };
    }

    if (val.properties[key].hasOwnProperty("enum")) {
      newObjConstr = {
        ...newObjConstr,
        [key]: parseEnum(val.properties[key].enum)
      };
    }

    if (val.properties[key].type === "object") {
      newObjConstr = {
        ...newObjConstr,
        [key]: parseValue(val.properties[key])
      };
    }

    if (key === "attendees") {
      newObjConstr = {
        ...newObjConstr,
        attendees: parseValue(val.definitions.attendees)
      };
    }
  }
  return newObjConstr;
};
console.log("parseValue", parseValue(schema));
