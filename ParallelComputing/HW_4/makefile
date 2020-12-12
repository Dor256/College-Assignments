build:
	mpicxx -c validator.c -o validator.o
	mpicxx -c cipher.c -o cipher.o
	mpicxx -openmp -c main.c -o main.o
	mpicxx -openmp -c helpers.c -o helpers.o
	# mpicxx -openmp -c ompHistogram.c -o ompHistogram.o
	# nvcc -I./includes -c cudaHistogram.cu -o cudaHistogram.o
	mpicxx -openmp -o main main.o cipher.o validator.o helpers.o
	# mpicxx -fopenmp -o main main.o cipher.o validator.o helpers.o ompHistogram.o cudaHistogram.o /usr/local/cuda-9.1/lib64/libcudart_static.a -ldl -lrt

clean:
	rm -f *.o ./main

run:
	mpiexec -np 2 ./main $(length) $(file) ${words}

runOn2:
	mpiexec -np 2 -machinefile machine-file -map-by node ./main $(length) $(file) $(words)