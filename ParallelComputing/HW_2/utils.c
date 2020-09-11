#include "utils.h"

bool isMaster(int rank){
	return rank == MASTER_RANK;
}

bool isSameEvenValue(int num1, int num2){
	return isEven(num1) == isEven(num2);
}

bool isEven(int num) {
	return num % 2 == 0;
}

enum SortDirection getSortDirection(int myRowCoord, enum MatrixPassBy direction) {
	return direction == COLS ? ASC : getSortDirectionByRows(myRowCoord);
}

enum SortDirection getSortDirectionByRows(int myRowCoord){
	return isEven(myRowCoord) ? ASC : DESC;
}

enum CommunicationDirection getCommMethod(int iter, enum SortDirection myCoordAtDirection) {
	return isSameEvenValue(iter,myCoordAtDirection) ? SEND : REC;
}

int getNeighborToExchangeWith(int commMethod, int neighbor1, int neighbor2) {
	return commMethod == REC ? neighbor1 : neighbor2;
}