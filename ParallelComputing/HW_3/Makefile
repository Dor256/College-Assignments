build:
	mpicxx -fopenmp -c main.c -o main.o
	mpicxx -fopenmp -c helpers.c -o helpers.o
	mpicxx -fopenmp -c ompHistogram.c -o ompHistogram.o
	nvcc -I./includes -c cudaHistogram.cu -o cudaHistogram.o
	mpicxx -fopenmp -o main main.o helpers.o ompHistogram.o cudaHistogram.o /usr/local/cuda-9.1/lib64/libcudart_static.a -ldl -lrt

clean:
	rm -f *.o ./main

run:
	mpiexec -np 2 ./main $(file)

runOn2:
	mpiexec -np 2 -machinefile machine-file -map-by node ./main $(file)
