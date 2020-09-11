#ifndef UTILS_H_
#define UTILS_H_

#include <stdio.h>
#include <stdbool.h>
#include <stdlib.h>

#define MASTER_RANK 0

typedef enum SortDirection{
	ASC = 0,
	DESC = 1
}SortDirection;

typedef enum MatrixPassBy{
	COLS = 0,
	ROWS = 1
}MatrixPassBy;

typedef enum CommunicationDirection{
	REC = 0,
	SEND = 1
}CommunicationDirection;

bool isMaster(int rank);

bool isSameEvenValue(int num1, int num2);

bool isEven(int num);

enum SortDirection getSortDirection(int myRowCoord, enum MatrixPassBy direction);

enum SortDirection getSortDirectionByRows(int myRowCoord);

enum CommunicationDirection getCommMethod(int iter, enum SortDirection myCoordAtDirection);

int getNeighborToExchangeWith(int commMethod, int neighbor1, int neighbor2);


#endif
