Final project Parallel Computing

IMPORTANT!
This project uses the GLib library from GNOME.
The  makefile should handle the compiling and linking for the library but on some Linux machines
the compilation might fail due to a missing glibconfig.h. For those cases I've supplied a bash script that will fix the issue - see bootstrap.sh.
Before running bootstrap.sh make sure you have given the script execution permissions.

Compiling the project:
Running `make build` should compile everything.

Running the project:
The program will need 2 arguments to run and a third optional argument:
 1. length - The encryption key length (minimum is 4)
 2. file - The encrypted file path
 3. [optional] words - Path for a word file to check the decrypted text against (if not provided the file used will be the default unix words file)

Open the terminal and run `make run length=<length> file=<file> [optional] words=<words>`
The program will output the decrypted plaintext and the encryption key in the terminal.

The work in this program is divided like so:
- CUDA - I did not use CUDA for this program
- MPI - MPI was used to prepare and divide the data between processes before distributing it to OpenMP.
- OpenMP - OpenMP was used to find the key by bruteforce with parallel computing (each process uses 4 threads and is configurable)

The check for expected words is done inside validator.c and is simple checking for each word inside the decrypted text if it exists in the hashtable.
The hashtable is taken from the GLib library as explained above.
