/*
 * Numera — C conversion core
 * Refactored from the original menu-driven nsc.c assignment.
 * Supports whole-number conversion between bases 2, 8, 10 and 16.
 * This source is kept as the C implementation/reference for the project.
 */
#include <ctype.h>
#include <stdint.h>
#include <stddef.h>

static int digit_value(char c) {
    if (c >= '0' && c <= '9') return c - '0';
    if (c >= 'a' && c <= 'f') return c - 'a' + 10;
    if (c >= 'A' && c <= 'F') return c - 'A' + 10;
    return -1;
}

/* Returns 1 on success, 0 for invalid input or unsupported bases. */
int numera_convert(const char *input, unsigned from_base, unsigned to_base,
                   char *output, size_t output_size) {
    static const char alphabet[] = "0123456789ABCDEF";
    uint64_t value = 0;
    size_t i = 0, out_len = 0;
    int negative = 0;

    if (!input || !output || output_size < 2) return 0;
    if (!((from_base == 2 || from_base == 8 || from_base == 10 || from_base == 16) &&
          (to_base == 2 || to_base == 8 || to_base == 10 || to_base == 16))) return 0;
    if (input[0] == '-' || input[0] == '+') {
        negative = input[0] == '-';
        i++;
    }
    if (input[i] == '\0') return 0;

    for (; input[i] != '\0'; ++i) {
        int digit = digit_value(input[i]);
        if (digit < 0 || (unsigned)digit >= from_base) return 0;
        if (value > (UINT64_MAX - (unsigned)digit) / from_base) return 0;
        value = value * from_base + (unsigned)digit;
    }

    if (value == 0) output[out_len++] = '0';
    while (value > 0) {
        if (out_len + 1 >= output_size) return 0;
        output[out_len++] = alphabet[value % to_base];
        value /= to_base;
    }
    if (negative && !(out_len == 1 && output[0] == '0')) {
        if (out_len + 1 >= output_size) return 0;
        output[out_len++] = '-';
    }
    output[out_len] = '\0';
    /* Reverse the generated digits in place. */
    for (i = 0; i < out_len / 2; ++i) {
        char temp = output[i];
        output[i] = output[out_len - 1 - i];
        output[out_len - 1 - i] = temp;
    }
    return 1;
}
