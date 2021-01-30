build:
	mpicxx -c validator.c -I/usr/include/glib-2.0 -I/usr/lib/glib-2.0/include -lglib-2.0 -o validator.o
	mpicxx -c cipher.c -I/usr/include/glib-2.0 -I/usr/lib/glib-2.0/include -lglib-2.0 -o cipher.o
	mpicxx -fopenmp -c ompDecrypt.c -I/usr/include/glib-2.0 -I/usr/lib/glib-2.0/include -lglib-2.0 -o ompDecrypt.o
	mpicxx -fopenmp -c main.c -I/usr/include/glib-2.0 -I/usr/lib/glib-2.0/include -lglib-2.0 -o main.o
	mpicxx -fopenmp -c helpers.c -I/usr/include/glib-2.0 -I/usr/lib/glib-2.0/include -lglib-2.0 -o helpers.o
	# nvcc -I./includes -c cudaCipher.cu -o cudaCipher.o
	# mpicxx -fopenmp -o main main.o cipher.o validator.o helpers.o ompDecrypt.o
	mpicxx -fopenmp -o main main.o cipher.o validator.o helpers.o ompDecrypt.o /usr/local/cuda-9.1/lib64/libcudart_static.a -ldl -lrt -lglib-2.0

clean:
	rm -f *.o ./main

run:
	mpiexec -np 2 ./main $(length) $(file) ${words}

runOn2:
	mpiexec -np 2 -machinefile machine-file -map-by node ./main $(length) $(file) $(words)