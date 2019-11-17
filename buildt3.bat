set T2DIR=tads2\
set TADSUNIXDIR=tadsunix\
set TADSES6=tads2es6\
set T3ES6=tads3es6\
set T3DIR=tads3\
set REG_BUILTIN_CHAR=%T3DIR%vmbifreg.cpp
rem (network version) set REG_BUILTIN_CHAR=tads3\vmbifregn.cpp
rem set EMCC_AUTODEBUG=1
rem set CCOPTS=-s ASSERTIONS=1 -s WASM=1 -s DISABLE_EXCEPTION_CATCHING=0 -s SAFE_HEAP=1 --profiling-funcs -DHTML5 -DOSANSI -DUSE_HTML -DUNIX -DHAVE_STRCASECMP  -DVMGLOB_VARS -DOS_DECLARATIVE_TLS -DTC_TARGET_T3 -DUSE_GENRAND -DUSE_DOSEXT -g 
rem set LDOPTS=-s ASSERTIONS=1 -s WASM=1 -s MODULARIZE=1 -s DISABLE_EXCEPTION_CATCHING=0  -s SAFE_HEAP=1 --profiling-funcs -s "EXPORT_NAME='TadsLoader'" -g
set CCOPTS=-s ASSERTIONS=1 -s WASM=1 -s DISABLE_EXCEPTION_CATCHING=0 -DHTML5 -DOSANSI -DUSE_HTML -DUNIX -DHAVE_STRCASECMP  -DVMGLOB_VARS -DOS_DECLARATIVE_TLS -DTC_TARGET_T3 -DUSE_GENRAND -DUSE_DOSEXT -O2 
set LDOPTS=-s ASSERTIONS=1 -s WASM=1 -s MODULARIZE=1 -s DISABLE_EXCEPTION_CATCHING=0 -s "EXPORT_NAME='TadsLoader'" -O2

mkdir obj

call emcc -std=c++11  -I%T3ES6% -Itads2es6\ -I%T3DIR% -Itads2\ -Itadsunix\ %T3DIR%vmrunsym.cpp %T3DIR%tcprs.cpp %T3DIR%tcprs_rt.cpp %T3DIR%tcprsnf.cpp %T3DIR%tcprsstm.cpp %T3DIR%tcprsnl.cpp %T3DIR%tcgen.cpp %T3DIR%tcglob.cpp %T3DIR%tcerr.cpp %T3DIR%tcerrmsg.cpp %T3DIR%tctok.cpp %T3DIR%tcmain.cpp %T3DIR%tcsrc.cpp %T3DIR%tchostsi.cpp %T3DIR%tclibprs.cpp %T3DIR%tccmdutl.cpp %T3DIR%tct3.cpp %T3DIR%tct3stm.cpp %T3DIR%tct3unas.cpp %T3DIR%tct3nl.cpp %T3DIR%tct3_d.cpp  -o obj/t3dyncomp.o %CCOPTS%

rem (no network version)
call emcc -std=c++11 -I%T3ES6% -Itads2es6\ -I%T3DIR% -Itads2\ -Itadsunix\ %T3DIR%vmnetfillcl.cpp  -o obj/t3net.o %CCOPTS%

rem TADSNET version
rem call emcc -std=c++11 -I%T3ES6% -Itads2es6\ -I%T3DIR% -Itads2\ -Itadsunix\ %T3DIR%vmhttpsrv.cpp %T3DIR%vmhttpreq.cpp %T3DIR%vmbifnet.cpp %T3DIR%vmnetui.cpp %T3DIR%vmnetcfg.cpp %T3DIR%vmnetfil.cpp %T3DIR%vmnetfillcl.cpp %T3DIR%osnetdos.cpp %T3DIR%osnetwin.cpp %T3DIR%osnetcli.cpp %T3DIR%osifcnet.cpp %T3DIR%vmrefcnt.cpp %T3DIR%osnet-connect.cpp %T3DIR%osnet-fgwin.cpp %T3DIR%vmnet.cpp -o obj/t3net.o %CCOPTS%

rem (custom network version)
rem call emcc -std=c++11 -I%T3ES6% -Itads2es6\ -I%T3DIR% -Itads2\ -Itadsunix\ %T3DIR%vmnetfillcl.cpp %T3DIR%vmbifnet.cpp %T3DIR%vmnetfil.cpp -o obj/t3net.o %CCOPTS%


call emcc -I%T3ES6% -Itads2es6\ -I%T3DIR% -Itads2\ -Itadsunix tads2es6\oses6.cc tadsunix\osportableread.c %T2DIR%osifc.c %T2DIR%osgen3.c  %T2DIR%osstzprs.c %T2DIR%osrestad.c %TADSES6%osnoui.c -o obj/t3os.o %CCOPTS%

call emcc -std=c++11  -I%T3ES6% -Itads2es6\ -I%T3DIR% -Itads2\ -Itadsunix\  %T3DIR%vmmain.cpp %T3DIR%std.cpp  %T3DIR%std_dbg.cpp %T3DIR%charmap.cpp %T3DIR%resload.cpp %T3DIR%resldexe.cpp %T3DIR%vminit.cpp %T3DIR%vmini_nd.cpp %T3DIR%vmconsol.cpp %T3DIR%vmconhtm.cpp %T3DIR%vmconhmp.cpp %T3DIR%vminitim.cpp %T3DIR%vmcfgmem.cpp %T3DIR%vmobj.cpp %T3DIR%vmundo.cpp %T3DIR%vmtobj.cpp %T3DIR%vmpat.cpp %T3DIR%vmstrcmp.cpp %T3DIR%vmdict.cpp  %T3DIR%vmgram.cpp  %T3DIR%vmstr.cpp  %T3DIR%vmcoll.cpp  %T3DIR%vmiter.cpp  %T3DIR%vmfref.cpp  %T3DIR%vmlst.cpp  %T3DIR%vmsort.cpp  %T3DIR%vmsortv.cpp  %T3DIR%vmbignum.cpp  %T3DIR%vmbignumlib.cpp  %T3DIR%vmvec.cpp  %T3DIR%vmintcls.cpp  %T3DIR%vmanonfn.cpp  %T3DIR%vmlookup.cpp  %T3DIR%vmstrbuf.cpp  %T3DIR%vmdynfunc.cpp  %T3DIR%vmbytarr.cpp  %T3DIR%vmdate.cpp  %T3DIR%vmtzobj.cpp  %T3DIR%vmtz.cpp  %T3DIR%vmcset.cpp  %T3DIR%vmfilobj.cpp  %T3DIR%vmfilnam.cpp  %T3DIR%vmtmpfil.cpp  %T3DIR%vmpack.cpp  %T3DIR%sha2.cpp  %T3DIR%md5.cpp  %T3DIR%vmstack.cpp  %T3DIR%vmerrmsg.cpp  %T3DIR%vmpool.cpp  %T3DIR%vmpoolim.cpp  %T3DIR%vmtype.cpp  %T3DIR%vmtypedh.cpp  %T3DIR%utf8.cpp  %T3DIR%vmglob.cpp  %T3DIR%vmrun.cpp  %T3DIR%vmop.cpp  %T3DIR%vmfunc.cpp  %T3DIR%vmmeta.cpp  %T3DIR%vmsa.cpp  %T3DIR%vmbif.cpp  %T3DIR%vmbifl.cpp  %T3DIR%vmimage.cpp  %T3DIR%vmimg_nd.cpp  %T3DIR%vmsrcf.cpp  %T3DIR%vmfile.cpp  %T3DIR%vmbiftad.cpp  %T3DIR%vmisaac.cpp  %T3DIR%vmbiftio.cpp  %T3DIR%askf_os3.cpp  %T3DIR%indlg_tx3.cpp  %T3DIR%vmsave.cpp  %T3DIR%vmcrc.cpp  %T3DIR%vmbift3.cpp  %T3DIR%vmbt3_nd.cpp  %T3DIR%vmregex.cpp  %T3DIR%vmhosttx.cpp  %T3DIR%vmhostsi.cpp  %T3DIR%vmhash.cpp  %T3DIR%vmlog.cpp  %T3DIR%derived/vmuni_cs.cpp %T3DIR%vmmcreg.cpp %REG_BUILTIN_CHAR% %T3ES6%vmmaincl.cpp %T3ES6%vmerr.cpp  -o obj/t3main.o %CCOPTS%

call emcc obj\t3main.o obj\t3dyncomp.o obj\t3os.o obj\t3net.o -o bin\lib\t3.js --js-library %TADSES6%\tadsthunk.js %LDOPTS%
