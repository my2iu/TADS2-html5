#include "os.h"
#include "lib.h"
#include <emscripten.h>

extern "C" {


int trdmain(int argc, char *argv[], appctxdef *appctx, char *save_ext);


int EMSCRIPTEN_KEEPALIVE tads_worker_main()
//int main()
{
    int   argc = 2;
    char *argv[] = {"tr_es6", "game.gam"};
    int err;

    os_init(&argc, argv, (char *)0, (char *)0, 0);
    err = os0main2(argc, argv, trdmain, "", "config.tr", 0);
    os_uninit();
    os_term(err);
	return 0;
}

int EMSCRIPTEN_KEEPALIVE tads_worker_main_with_restore()
{
    int   argc = 4;
    char *argv[] = {"tr_es6", "-r", "restore.sav", "game.gam"};
    int err;

    os_init(&argc, argv, (char *)0, (char *)0, 0);
    err = os0main2(argc, argv, trdmain, "", "config.tr", 0);
    os_uninit();
    os_term(err);
	return 0;
}



} // extern "C"