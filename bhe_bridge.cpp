/*
 * bhe_bridge.cpp
 *
 * A command-line bridge that lets web apps use the BoundedHomopolymerEncoder
 * and BoundedHomopolymerDecoder for individual strings.
 *
 * Usage modes:
 *   bhe_bridge encode <k> <encoding_length> <input_data_length> <binary_string>
 *   bhe_bridge decode <k> <encoding_length> <input_data_length> <base4_string>
 *
 * Output: a single line with the result, or "ERROR: <message>".
 */

#include <iostream>
#include <string>
#include <cstring>

#define BOUNDED_HOMOPOLYMER_NO_MAIN
#define BOUNDED_HOMOPOLYMER_SILENT
#include "BoundedHomopolymerEncoding.cpp"
#undef BOUNDED_HOMOPOLYMER_NO_MAIN
#undef BOUNDED_HOMOPOLYMER_SILENT

int main(int argc, char* argv[]) {
    if (argc != 6) {
        std::cerr << "Usage: bhe_bridge <encode|decode> <k> <encoding_length> <input_data_length> <data>" << std::endl;
        return 1;
    }

    std::string mode = argv[1];
    int k = std::atoi(argv[2]);
    int encoding_length = std::atoi(argv[3]);
    int input_data_length = std::atoi(argv[4]);
    std::string data = argv[5];

    if (k < 1 || k > 5) {
        std::cout << "ERROR: k must be between 1 and 5" << std::endl;
        return 1;
    }

    if (mode == "encode") {
        // Validate binary input
        for (char c : data) {
            if (c != '0' && c != '1') {
                std::cout << "ERROR: input must be a binary string (only 0s and 1s)" << std::endl;
                return 1;
            }
        }
        if ((int)data.length() != input_data_length) {
            std::cout << "ERROR: input length does not match input_data_length" << std::endl;
            return 1;
        }

        BoundedHomopolymerEncoder encoder(k, encoding_length, input_data_length);
        if (encoder.max_data_length() < input_data_length) {
            std::cout << "ERROR: input too long for this encoding length. Max is "
                      << encoder.max_data_length() << " bits." << std::endl;
            return 1;
        }

        std::string encoded = encoder.encode(data);
        std::cout << encoded << std::endl;
    } else if (mode == "decode") {
        // Validate base-4 input
        for (char c : data) {
            if (c < '0' || c > '3') {
                std::cout << "ERROR: encoded data must be a base-4 string (digits 0-3)" << std::endl;
                return 1;
            }
        }
        if ((int)data.length() != encoding_length) {
            std::cout << "ERROR: encoded data length does not match encoding_length" << std::endl;
            return 1;
        }

        BoundedHomopolymerDecoder decoder(k, encoding_length, input_data_length);
        std::string decoded = decoder.decode(data);
        std::cout << decoded << std::endl;
    } else {
        std::cout << "ERROR: unknown mode. Use 'encode' or 'decode'." << std::endl;
        return 1;
    }

    return 0;
}
