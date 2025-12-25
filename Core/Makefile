CC = gcc
CFLAGS = -Wall -Wextra -std=c11 -I./src
SRC = src/main.c src/conics.c src/ecc.c src/cjson/cJSON.c
OUT = bin/conicrypt

all:
	mkdir -p bin
	$(CC) $(CFLAGS) $(SRC) -lm -o $(OUT)

clean:
	rm -f $(OUT)

.PHONY: all clean
