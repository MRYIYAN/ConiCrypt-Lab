CC=gcc
CFLAGS=-O2 -Wall -Wextra -Wpedantic -std=c11
SRC=src/main.c src/conics.c src/ecc.c
BIN=bin/conicrypt

all:
	mkdir -p bin
	$(CC) $(SRC) -o $(BIN) $(CFLAGS)

clean:
	rm -rf bin

.PHONY: all clean
