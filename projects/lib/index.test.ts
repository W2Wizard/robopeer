//=============================================================================
// W2Wizard, Amsterdam @ 2018-2023
// See README and LICENSE files for details.
//=============================================================================

import { dlopen, FFIType, ptr, toArrayBuffer } from "bun:ffi";
import { describe, expect, it, beforeAll, afterAll } from "bun:test";

/**
 * WARNING: bun:ffi does not manage memory for you.
 * You must free the memory when you're done with it.
 *
 * This is very important regarding functions that return allocated memory.
 * (ft_split, ft_strtrim, ft_itoa, etc.)
 *
 * Might be useful for code execution of C files directly:
 * @see https://github.com/TinyCC/tinycc
 *
 * TODO: What happens when you segfault in a function?
 */
//=============================================================================

// TODO: Come up with a neater way to generate the type definitions?
// NOTE(W2): Convert the static library to a shared library for dlopen to work.
const { symbols, close } = dlopen("libft.so", {
	ft_strdup: {
		returns: FFIType.ptr,
		args: [FFIType.ptr],
	},
	ft_strlen: {
		returns: FFIType.i32,
		args: [FFIType.ptr],
	},
	ft_isalpha: {
		returns: FFIType.i32,
		args: [FFIType.i32],
	},
	ft_isdigit: {
		returns: FFIType.i32,
		args: [FFIType.i32],
	},
	ft_isalnum: {
		returns: FFIType.i32,
		args: [FFIType.i32],
	},
	ft_isascii: {
		returns: FFIType.i32,
		args: [FFIType.i32],
	},
	ft_isprint: {
		returns: FFIType.i32,
		args: [FFIType.i32],
	},
	ft_memset: {
		returns: FFIType.ptr,
		args: [FFIType.ptr, FFIType.i32, FFIType.i32],
	},
	ft_bzero: {
		returns: FFIType.ptr,
		args: [FFIType.ptr, FFIType.i32],
	},
	ft_memcpy: {
		returns: FFIType.ptr,
		args: [FFIType.ptr, FFIType.ptr, FFIType.i32],
	},
	ft_memmove: {
		returns: FFIType.ptr,
		args: [FFIType.ptr, FFIType.ptr, FFIType.i32],
	},
	ft_strlcpy: {
		returns: FFIType.i32,
		args: [FFIType.ptr, FFIType.ptr, FFIType.i32],
	},
	ft_strlcat: {
		returns: FFIType.i32,
		args: [FFIType.ptr, FFIType.ptr, FFIType.i32],
	},
	ft_toupper: {
		returns: FFIType.i32,
		args: [FFIType.i32],
	},
	ft_tolower: {
		returns: FFIType.i32,
		args: [FFIType.i32],
	},
	ft_strchr: {
		returns: FFIType.ptr,
		args: [FFIType.ptr, FFIType.i32],
	},
	ft_strrchr: {
		returns: FFIType.ptr,
		args: [FFIType.ptr, FFIType.i32],
	},
	ft_strncmp: {
		returns: FFIType.i32,
		args: [FFIType.ptr, FFIType.ptr, FFIType.i32],
	},
	ft_memchr: {
		returns: FFIType.ptr,
		args: [FFIType.ptr, FFIType.i32, FFIType.i32],
	},
	ft_memcmp: {
		returns: FFIType.i32,
		args: [FFIType.ptr, FFIType.ptr, FFIType.i32],
	},
	ft_strnstr: {
		returns: FFIType.ptr,
		args: [FFIType.ptr, FFIType.ptr, FFIType.i32],
	},
	ft_atoi: {
		returns: FFIType.i32,
		args: [FFIType.ptr],
	},
});

afterAll(close);
beforeAll(() => {
	["SIGINT", "SIGTERM", "SIGHUP"].forEach((signal) => {
		process.on(signal, () => {
			close();
			throw new Error(`Signal ${signal} received.`);
		});
	});
});


// makefile
//=============================================================================
describe("makefile", () => {
	it("compiles with '-Wextra -Werror -Wall'", async () => {
		const makefile = Bun.file("Makefile");
		const text = await makefile.text();
		const requiredFlags = ["-Wall", "-Wextra", "-Werror"];

		expect(requiredFlags.every((flag) => text.includes(flag))).toBe(true);
	});
});

// strdup
//=============================================================================
// describe("strdup", () => {
// 	it("duplicates a string", () => {
// 		const sample = "Hello, world!";
// 		const ptrSample = ptr(Buffer.from(`${sample}\0`, "utf8"));
// 		const result = toArrayBuffer(symbols.ft_strdup(ptrSample), 0, sample.length);
// 		const output = Buffer.from(result).toString("utf8");
// 		expect(output).toBe(sample);
// 	});

// 	it("returns null if the string is empty", () => {
// 		const emptyStr = Buffer.from(`\0`, "utf8");
// 		expect(symbols.ft_strdup(ptr(emptyStr))).toBe(null);
// 	});
// });

// isalpha
//=============================================================================
describe("isalpha", () => {
  it("valid alphabetic characters", () => {
    const alphabeticChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (const char of alphabeticChars) {
      expect(symbols.ft_isalpha(char.charCodeAt(0))).toBe(1);
    }
  });

  it("invalid non-alphabetic characters", () => {
    const nonAlphabeticChars = "0123456789!@#$%^&*()_+-=[]{};':\",.<>?/\\|";
    for (const char of nonAlphabeticChars) {
      expect(symbols.ft_isalpha(char.charCodeAt(0))).toBe(0);
    }
  });
});

// isdigit
//=============================================================================
describe("isdigit", () => {
  it("valid numeric characters", () => {
    const numericChars = "0123456789";
    for (const char of numericChars) {
      expect(symbols.ft_isdigit(char.charCodeAt(0))).toBe(1);
    }
  });

  it("invalid non-numeric characters", () => {
    const nonNumericChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()_+-=[]{};':\",.<>?/\\|";
    for (const char of nonNumericChars) {
      expect(symbols.ft_isdigit(char.charCodeAt(0))).toBe(0);
    }
  });
});

// isalnum
//=============================================================================
describe("isalnum", () => {
  it("valid alphanumeric characters", () => {
    const alphanumericChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    for (const char of alphanumericChars) {
      expect(symbols.ft_isalnum(char.charCodeAt(0))).toBe(1);
    }
  });

  it("invalid non-alphanumeric characters", () => {
    const nonAlphanumericChars = "!@#$%^&*()_+-=[]{};':\",.<>?/\\|";
    for (const char of nonAlphanumericChars) {
      expect(symbols.ft_isalnum(char.charCodeAt(0))).toBe(0);
    }
  });
});

// isascii
//=============================================================================
describe("isascii", () => {
  it("valid ASCII characters", () => {
    for (let i = 0; i < 128; i++) {
      expect(symbols.ft_isascii(i)).toBe(1);
    }
  });

  it("invalid non-ASCII characters", () => {
    for (let i = 128; i < 256; i++) {
      expect(symbols.ft_isascii(i)).toBe(0);
    }
  });
});

// isprint
//=============================================================================
describe("isprint", () => {
  it("valid printable characters", () => {
    const printableChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{};':\",.<>?/\\| ";
    for (const char of printableChars) {
      expect(symbols.ft_isprint(char.charCodeAt(0))).toBe(1);
    }
  });

  it("invalid non-printable characters", () => {
    for (let i = 0; i < 32; i++) {
      expect(symbols.ft_isprint(i)).toBe(0);
    }
  });
});

// strlen
//=============================================================================
describe("strlen", () => {
  it("normal string", () => {
    const sample = "Hello, world!";
    const str = ptr(Buffer.from(`${sample}\0`, "utf8"));
    expect(symbols.ft_strlen(str)).toBe(sample.length);
  });

  it("empty string", () => {
    const str = ptr(Buffer.from(`\0`, "utf8"));
    expect(symbols.ft_strlen(str)).toBe(0);
  });
});

// memset
//=============================================================================
describe("memset", () => {
  it("set characters to a value", () => {
		const size = 42;
    const value = 42; // *
    const buffer = Buffer.alloc(size);

    symbols.ft_memset(ptr(buffer), value, size);
		buffer.forEach((byte) => expect(byte).toBe(value));
  });
});

// bzero (Note: bzero is equivalent to memset with value 0)
//=============================================================================
describe("bzero", () => {
  it("zeroes out a buffer", () => {
    const size = 10;
    const buffer = Buffer.alloc(size, 42);

    symbols.ft_bzero(ptr(buffer), size);
		buffer.forEach((byte) => expect(byte).toBe(0));
  });
});

// memcpy
//=============================================================================
describe("memcpy", () => {
  it("copies data from source to destination", () => {
		const source = Buffer.from("Hello, world!\0");
    const destination = Buffer.alloc(source.length);

    symbols.ft_memcpy(ptr(destination), ptr(source), source.length);
    expect(destination.toString("utf8")).toBe(source.toString("utf8"));
  });
});

// ft_memmove
//=============================================================================
describe("memmove", () => {
  it("copies overlapping data from source to destination", () => {
    const source = Buffer.from("Hello, world!\0");
    const destination = Buffer.alloc(source.length);

    symbols.ft_memmove(ptr(source), ptr(destination), source.length);
    expect(destination.toString("utf8")).toBe(source.toString("utf8"));
  });
});

// // strlcpy
// //=============================================================================
// describe("strlcpy", () => {
//   it("copies a string to a destination buffer", () => {
//     const source = "Hello, world!";
//     const destination = Buffer.alloc(source.length + 1);
// 		const ptrSource = ptr(Buffer.from(`${source}\0`, "utf8"));
// 		const ptrDestination = ptr(destination);

// 		const result = symbols.ft_strlcpy(ptrDestination, ptrSource, destination.length);
// 		expect(destination.toString("utf8")).toBe(Buffer.from(`${source}\0`, "utf8").toString("utf8"));
// 		expect(result).toBe(source.length);
//   });
// });

// // strlcat
// //=============================================================================
// describe("strlcat", () => {
//   it("concatenates two strings to a destination buffer", () => {
//     const source1 = "Hello, ";
//     const source2 = "world!";
// 		const expected = "Hello, world!";
//     const destination = Buffer.alloc(source1.length + source2.length + 1);

//     const ptrSource1 = ptr(Buffer.from(`${source1}\0`, "utf8"));
//     const ptrSource2 = ptr(Buffer.from(`${source2}\0`, "utf8"));
//     const ptrDestination = ptr(destination);

//     symbols.ft_strlcpy(ptrDestination, ptrSource1, destination.length);
//     const result = symbols.ft_strlcat(ptrDestination, ptrSource2, destination.length);
//     expect(destination.toString("utf8")).toBe(Buffer.from(`${expected}\0`, "utf8").toString("utf8"));
//     expect(result).toBe(expected.length);
//   });
// });

// // toupper
// //=============================================================================
// describe("toupper", () => {
//   it("converts lowercase characters to uppercase", () => {
//     const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
//     const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//     for (let i = 0; i < lowercaseChars.length; i++) {
//       const char = lowercaseChars[i];
//       const expectedUppercaseChar = uppercaseChars[i];
//       expect(symbols.ft_toupper(char.charCodeAt(0))).toBe(expectedUppercaseChar.charCodeAt(0));
//     }
//   });

//   it("leaves non-lowercase characters unchanged", () => {
//     const nonLowercaseChars = "0123456789!@#$%^&*()_+-=[]{};':\",.<>?/\\|ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//     for (const char of nonLowercaseChars) {
//       expect(symbols.ft_toupper(char.charCodeAt(0))).toBe(char.charCodeAt(0));
//     }
//   });
// });

// // tolower
// //=============================================================================
// describe("tolower", () => {
//   it("converts uppercase characters to lowercase", () => {
//     const lowercaseChars = "abcdefghijklmnopqrstuvwxyz";
//     const uppercaseChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
//     for (let i = 0; i < lowercaseChars.length; i++) {
//       const char = uppercaseChars[i];
//       const expectedLowercaseChar = lowercaseChars[i];
//       expect(symbols.ft_tolower(char.charCodeAt(0))).toBe(expectedLowercaseChar.charCodeAt(0));
//     }
//   });

//   it("leaves non-uppercase characters unchanged", () => {
//     const nonUppercaseChars = "0123456789!@#$%^&*()_+-=[]{};':\",.<>?/\\|abcdefghijklmnopqrstuvwxyz";
//     for (const char of nonUppercaseChars) {
//       expect(symbols.ft_tolower(char.charCodeAt(0))).toBe(char.charCodeAt(0));
//     }
//   });
// });

// // strchr
// //=============================================================================
// describe("strchr", () => {
//   it("finds the first occurrence of a character in a string", () => {
// 		const str = "Hello, world!";
// 		const char = "o";
// 		const ptrStr = ptr(Buffer.from(`${str}\0`, "utf8"));
// 		const result = symbols.ft_strchr(ptrStr, char.charCodeAt(0));
// 		expect(result).toBe(ptrStr + 4);
//   });

//   it("returns null if the character is not found", () => {
// 		const str = "Hello, world!";
// 		const char = "z";
// 		const ptrStr = ptr(Buffer.from(`${str}\0`, "utf8"));
// 		const result = symbols.ft_strchr(ptrStr, char.charCodeAt(0));
// 		expect(result).toBe(null);
//   });
// });

// // strrchr
// //=============================================================================
// describe("strrchr", () => {
//   it("finds the last occurrence of a character in a string", () => {
// 		const str = "Hello, world!";
// 		const char = "o";
// 		const ptrStr = ptr(Buffer.from(`${str}\0`, "utf8"));
// 		const result = symbols.ft_strrchr(ptrStr, char.charCodeAt(0));
// 		expect(result).toBe(ptrStr + 8);
// 	});

//   it("returns null if the character is not found", () => {
// 		const str = "Hello, world!";
// 		const char = "z";
// 		const ptrStr = ptr(Buffer.from(`${str}\0`, "utf8"));
// 		const result = symbols.ft_strrchr(ptrStr, char.charCodeAt(0));
// 		expect(result).toBe(null);
//   });
// });

// // strncmp
// //=============================================================================
// describe("strncmp", () => {
//   it("compares two strings up to a specified length", () => {
//     const str1 = "Hello";
//     const str2 = "Hello, world!";
//     const length = 5;
//     const ptrStr1 = ptr(Buffer.from(`${str1}\0`, "utf8"));
//     const ptrStr2 = ptr(Buffer.from(`${str2}\0`, "utf8"));
//     expect(symbols.ft_strncmp(ptrStr1, ptrStr2, length)).toBe(0);
//   });

//   it("returns a negative value if str1 is less than str2", () => {
//     const str1 = "Hell";
//     const str2 = "Hello, world!";
// 		const length = 5;
// 		const ptrStr1 = ptr(Buffer.from(`${str1}\0`, "utf8"));
// 		const ptrStr2 = ptr(Buffer.from(`${str2}\0`, "utf8"));
// 		expect(symbols.ft_strncmp(ptrStr1, ptrStr2, length)).toBeLessThan(0);
//   });

//   it("returns a positive value if str1 is greater than str2", () => {
//     const str1 = "Hello!";
//     const str2 = "Hello, world!";
//     const length = 5;
//     const ptrStr1 = ptr(Buffer.from(`${str1}\0`, "utf8"));
//     const ptrStr2 = ptr(Buffer.from(`${str2}\0`, "utf8"));
// 		expect(symbols.ft_strncmp(ptrStr1, ptrStr2, length)).toBeGreaterThanOrEqual(0);
// 	});
// });

// // memchr
// //=============================================================================
// describe("memchr", () => {
//   it("finds the first occurrence of a byte in a memory region", () => {
// 		const data = Buffer.from([0x41, 0x42, 0x43, 0x44, 0x45]); // ABCDE
// 		const byte = 0x43; // C

// 		const ptrData = ptr(data);
// 		const result = symbols.ft_memchr(ptrData, byte, data.length);
// 		expect(result).toBe(ptrData + 2);
//   });

//   it("returns null if the byte is not found", () => {
// 		const data = Buffer.from([0x41, 0x42, 0x43, 0x44, 0x45]); // ABCDE
// 		const byte = 0x46; // F

// 		const ptrData = ptr(data);
// 		const result = symbols.ft_memchr(ptrData, byte, data.length);
// 		expect(result).toBe(null);
//   });
// });

// // memcmp
// //=============================================================================
// describe("memcmp", () => {
//   it("compares two memory regions up to a specified length", () => {
//     const data1 = Buffer.from([0x41, 0x42, 0x43, 0x44, 0x45]); // ABCDE
//     const data2 = Buffer.from([0x41, 0x42, 0x43, 0x44, 0x46]); // ABCDF
//     const length = 5;
//     const ptrData1 = ptr(data1);
//     const ptrData2 = ptr(data2);
//     expect(symbols.ft_memcmp(ptrData1, ptrData2, length)).toBe(-1);
//   });

//   it("returns 0 if both memory regions are equal", () => {
//     const data1 = Buffer.from([0x41, 0x42, 0x43, 0x44, 0x45]); // ABCDE
//     const data2 = Buffer.from([0x41, 0x42, 0x43, 0x44, 0x45]); // ABCDE
//     const length = 5;
//     const ptrData1 = ptr(data1);
//     const ptrData2 = ptr(data2);
//     expect(symbols.ft_memcmp(ptrData1, ptrData2, length)).toBe(0);
//   });

//   it("returns a positive value if data1 is greater than data2", () => {
//     const data1 = Buffer.from([0x41, 0x42, 0x43, 0x44, 0x47]); // ABCDG
//     const data2 = Buffer.from([0x41, 0x42, 0x43, 0x44, 0x46]); // ABCDF
//     const length = 5;
//     const ptrData1 = ptr(data1);
//     const ptrData2 = ptr(data2);
//     expect(symbols.ft_memcmp(ptrData1, ptrData2, length)).toBe(1);
//   });
// });

// // strnstr
// //=============================================================================
// describe("strnstr", () => {
//   it("finds the first occurrence of a substring in a string up to a specified length", () => {
// 		const str = "Hello, world!";
// 		const substr = "world";
// 		const length = 13;
// 		const ptrStr = ptr(Buffer.from(`${str}\0`, "utf8"));
// 		const ptrSubstr = ptr(Buffer.from(`${substr}\0`, "utf8"));
// 		const result = symbols.ft_strnstr(ptrStr, ptrSubstr, length);
// 		expect(result).toBe(ptrStr + 7);
//   });

//   it("returns null if the substring is not found", () => {
// 		const str = "Hello, world!";
// 		const substr = "WORLD";
// 		const length = 13;
// 		const ptrStr = ptr(Buffer.from(`${str}\0`, "utf8"));
// 		const ptrSubstr = ptr(Buffer.from(`${substr}\0`, "utf8"));
// 		const result = symbols.ft_strnstr(ptrStr, ptrSubstr, length);
// 		expect(result).toBe(null);
//   });
// });

// // atoi
// //=============================================================================
// describe("atoi", () => {
//   it("converts a valid string to an integer", () => {
//     const numberStr = "12345";
//     const ptrNumberStr = ptr(Buffer.from(`${numberStr}\0`, "utf8"));
//     const result = symbols.ft_atoi(ptrNumberStr);
//     expect(result).toBe(12345);
//   });

//   it("returns 0 for an empty string", () => {
//     const emptyStr = "";
//     const ptrEmptyStr = ptr(Buffer.from(`${emptyStr}\0`, "utf8"));
//     const result = symbols.ft_atoi(ptrEmptyStr);
//     expect(result).toBe(0);
//   });

//   it("ignores leading whitespace characters", () => {
//     const numberStr = "   789";
//     const ptrNumberStr = ptr(Buffer.from(`${numberStr}\0`, "utf8"));
//     const result = symbols.ft_atoi(ptrNumberStr);
//     expect(result).toBe(789);
//   });

//   it("handles negative numbers", () => {
//     const numberStr = "-42";
//     const ptrNumberStr = ptr(Buffer.from(`${numberStr}\0`, "utf8"));
//     const result = symbols.ft_atoi(ptrNumberStr);
//     expect(result).toBe(-42);
//   });

//   it("stops parsing when encountering non-numeric characters", () => {
//     const numberStr = "123abc";
//     const ptrNumberStr = ptr(Buffer.from(`${numberStr}\0`, "utf8"));
//     const result = symbols.ft_atoi(ptrNumberStr);
//     expect(result).toBe(123);
//   });
// });
