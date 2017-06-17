set TADSDIR=tads2\
set TADSUNIXDIR=tadsunix\
set TADSES6=tads2es6\
rem set EMCC_AUTODEBUG=1
rem set CCOPTS=-s ASSERTIONS=1 -s SAFE_HEAP=1 --profiling-funcs -O2 
set CCOPTS=-s ASSERTIONS=1 -s SAFE_HEAP=1 --profiling-funcs -DOSANSI -DUSE_HTML -DUNIX -DHAVE_STRCASECMP 
set LDOPTS=-s ASSERTIONS=1 -s SAFE_HEAP=1 --profiling-funcs

mkdir obj
call emcc %TADSDIR%ler.c -I%TADSDIR% -I%TADSUNIXDIR%  -o obj\lib.o %CCOPTS%

call emcc %TADSDIR%mcm.c %TADSDIR%mcs.c %TADSDIR%mch.c %TADSDIR%obj.c %TADSDIR%cmd.c %TADSDIR%errmsg.c %TADSDIR%fioxor.c %TADSDIR%oserr.c %TADSDIR%runstat.c %TADSDIR%fio.c %TADSDIR%getstr.c %TADSDIR%cmap.c %TADSDIR%askf_os.c %TADSDIR%indlg_tx.c %TADSDIR%osifc.c %TADSUNIXDIR%osportableread.c obj\lib.o -I%TADSUNIXDIR% -I%TADSDIR%  -o obj\common.o %CCOPTS%

call emcc %TADSDIR%dat.c %TADSDIR%lst.c %TADSDIR%run.c %TADSDIR%out.c %TADSDIR%voc.c %TADSDIR%bif.c %TADSDIR%output.c %TADSDIR%suprun.c %TADSDIR%regex.c obj\common.o -I%TADSUNIXDIR% -I%TADSDIR% -o obj\cmnrun.o %CCOPTS%

call emcc %TADSDIR%vocab.c %TADSDIR%execmd.c %TADSDIR%ply.c %TADSDIR%qas.c %TADSDIR%trd.c %TADSDIR%dbgtr.c %TADSDIR%linfdum.c %TADSDIR%osrestad.c -I%TADSUNIXDIR% -I%TADSDIR% -o obj\run.o %CCOPTS%

call emcc %TADSDIR%bifgdum.c %TADSDIR%osgen3.c %TADSDIR%os0.c %TADSDIR%osnoui.c %TADSDIR%oem.c %TADSDIR%argize.c %TADSES6%os0tr.cc -DUSE_DOSEXT -DUSE_GENRAND -I%TADSUNIXDIR% -I%TADSDIR%  -o obj\char.o %CCOPTS%

call emcc obj\cmnrun.o obj\run.o obj\char.o -I%TADSUNIXDIR% -I%TADSDIR%  -o obj\tr.o  %CCOPTS%


call emcc obj\tr.o -o bin\lib\tr.js -s EXPORTED_FUNCTIONS="['_tads_worker_main']" --js-library %TADSES6%\tadsthunk.js %LDOPTS%