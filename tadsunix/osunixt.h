/* Copyright (c) 1992, 2002 Michael J. Roberts.  All Rights Reserved. */
/*
Name
  osunixt.h - operating system definitions for Unix-like system with
              termcap/termio capability
Function
  Definitions that vary by operating system
Notes
  None
Modified
Sun Jan 24 13:10:10 EST 1993    Dave Baggett    Created.
Thu Apr 22 01:38:20 EDT 1993    Dave Baggett    Incorporated NeXT, Linux,
                                                DJGCC_386, etc. changes.
Sat Jan 29 10:49:25 EST 1994    Dave Baggett    Updated for TADS 2.1.2.2
Fri Aug 26 14:47:38 EDT 1994    Dave Baggett    Updated for TADS 2.2.0.0
Sun Sep 25 13:43:28 EDT 1994    Dave Baggett    Updated for TADS 2.2.0.2
Tue Nov 22 15:16:10 EST 1994    Dave Baggett    Updated for TADS 2.2.0.5
*/

#ifndef OSUNIXT_INCLUDED
#define OSUNIXT_INCLUDED

#include <time.h>



//***********************************************************
// NEW STUFF ADDED HERE
#define OS_DECL_TLS(typ, varname)  __thread typ varname
#include <stdint.h>
typedef void * osdirhdl_t;
int osrp2_unsignedchar(const unsigned char *p);
#define osrp2(p) osrp2_unsignedchar((const unsigned char *)(p))
 int osrp2s_unsignedchar(unsigned char *p);
 #define osrp2s(p) osrp2s_unsignedchar((unsigned char *)(p))
//int osrp2(const unsigned char *p);
#define oswp2s(p,i) oswp2(p,i)
unsigned long osrp4_unsignedchar(const unsigned char *p);
#define osrp4(p) osrp4_unsignedchar((const unsigned char *)(p))
long osrp4s_unsignedchar(const unsigned char *p);
#define osrp4s(p) osrp4s_unsignedchar((const unsigned char *)(p))
void oswp4s_unsignedchar(const unsigned char *p, long l);
#define oswp4s(p, l) oswp4s_unsignedchar((const unsigned char *)(p), l)

#define OS_NEWLINE_SEQ "\n"
#define memicmp strncasecmp
#define OS_SYSTEM_NAME "EmscriptenUnix"
#define os_vasprintf vasprintf

#define ES6_FILE_BYPASS

#if defined(ES6_FILE_BYPASS)
#define OSFMODE_FILE   0x0001
#define OSFMODE_DIR    0x0002
#define OSFMODE_CHAR   0x0004
#define OSFMODE_BLK    0x0008
#define OSFMODE_PIPE   0x0010
#define OSFMODE_SOCKET 0x0020
#define OSFMODE_LINK   0x0040
#define OSFATTR_HIDDEN   0x0001 
#define OSFATTR_SYSTEM   0x0002 
#define OSFATTR_READ     0x0004 
#define OSFATTR_WRITE    0x0008 
#define OSPATHPWD "."
#ifndef OS_UCHAR_DEFINED
typedef unsigned char  uchar;
#define OS_UCHAR_DEFINED
#endif
#include <stdio.h>  // for FILE
/* os file structure */
struct EsFileProxy;
typedef struct EsFileProxy osfildef;
#define OSFSK_SET  SEEK_SET
#define OSFSK_CUR  SEEK_CUR
#define OSFSK_END  SEEK_END
#define OSFOPRB 0

int osfflush(osfildef *fp);
/* just stubbed out for now */
int osfmode(const char *fname, int follow_links,
            unsigned long *mode, unsigned long *attrs);
/* open text file for reading; returns NULL on error */
osfildef *osfoprt(char *fname, int typ);
/* open text file for writing; returns NULL on error */
osfildef *osfopwt(const char *fname, int typ);
/* open text file for reading/writing; don't truncate */
// no es6 definition
osfildef *osfoprwt(const char *fname, os_filetype_t typ);
/* open text file for reading/writing; truncate; returns NULL on error */
osfildef *osfoprwtt(char *fname, int typ);
/* open binary file for writing; returns NULL on error */
osfildef *osfopwb(const char *fname, int typ);
/* open source file for reading */
osfildef *osfoprs(char *fname, int typ);
/* open binary file for reading; returns NULL on erorr */
osfildef *osfoprb(const char *fname, int typ);
/* get a line of text from a text file (fgets semantics) */
char *osfgets(char *buf, size_t len, osfildef *fp);
/* open binary file for reading/writing; don't truncate */
// no es6 definition
osfildef *osfoprwtb(const char *fname, os_filetype_t typ); 
/* open binary file for reading/writing; truncate; returns NULL on error */
osfildef *osfoprwb(const char *fname, int typ);
/* write bytes to file; TRUE ==> error */
int osfwb_uchar(osfildef *fp, uchar *buf, int bufl);
#define osfwb(fp, buf, bufl) osfwb_uchar(fp, (uchar *)(buf), bufl) 
/* read bytes from file; TRUE ==> error */
int osfrb_uchar(osfildef *fp, uchar *buf, int bufl);
#define osfrb(fp, buf, bufl) osfrb_uchar(fp, (uchar *)(buf), bufl)
/* read bytes from file and return count; returns # bytes read, 0=error */
size_t osfrbc_uchar(osfildef *fp, uchar *buf, size_t bufl);
#define osfrbc(fp, buf, bufl) osfrbc_uchar(fp, (uchar *)(buf), bufl)
/* get position in file */
long osfpos(osfildef *fp);
/* seek position in file; TRUE ==> error */
int osfseek(osfildef *fp, long pos, int mode);
/* close a file */
void osfcls(osfildef *fp);
/* delete a file - TRUE if error */
int osfdel(const char *fname);
/* access a file - 0 if file exists */
int osfacc(const char *fname);
/* get a character from a file */
int osfgetc(osfildef *fp);
/* write a string to a file */
int osfputs(char *buf, osfildef *fp);
int os_rename_file(const char *oldname, const char *newname);

#endif

// comment out the lines for defining our_memcpy and for redefining memcpy and memmove from this file
// Although USE_STDIO is not defined, this file was changed to behave as if it were defined.
//***********************************************************


/* Use UNIXPATCHLEVEL, as defined in the makefile, for the port patch level */
#define TADS_OEM_VERSION  UNIXPATCHLEVEL

/* Use SYSPL, as defined in the makefile, for the patch sub-level */
#define OS_SYSTEM_PATCHSUBLVL  SYSPL

/* Use PORTER, from the makefile, for the OEM maintainer name */
#define TADS_OEM_NAME  PORTER

/* Use SYSNAME, as defined in the makefile, for the system's banner ID */
#define OS_SYSTEM_LDESC  SYSNAME

/*
 *   Define a startup message for the debugger warning that the debugger
 *   only works in 80x50 windows 
 */
#define OS_TDB_STARTUP_MSG \
   "NOTE: This program must be run in a 80x50 character window.\n"


/* maximum width (in characters) of a line of text */
#define OS_MAXWIDTH  255

/*
 * Make default buffer sizes huge.  (Why not?  We have virtual memory.)
 */
#include "osbigmem.h"

/*
 *   Swapping off by default, since Unix machines tend to be big compared
 *   to adventure games 
 */
#define OS_DEFAULT_SWAP_ENABLED  0

/*
 *   Usage lines - we use non-default names for the executables on Unix,
 *   so we need to adjust the usage lines accordingly. 
 */
# define OS_TC_USAGE  "usage: tadsc [options] file"
# define OS_TR_USGAE  "usage: tadsr [options] file"


/*
 * Get GCC varags defs
 */

#if !defined(IBM_RT)
#define USE_STDARG
#define USE_GCC_STDARG
#endif

#if defined(__STDC__) || defined(ULTRIX_MIPS) || defined(SGI_IRIX) || defined(NEXT) || defined(DJGCC_386) || defined(IBM_AIX)
#include <stdarg.h>             /* get native stdargs */
#else
#include "gccstdar.h"           /* get GCC stdargs */
#endif

/*
 * Define the following to use sgtty.h instead of termios or direct
 * ioctl hacking.
 */
#if defined(NEXT) || defined(IBM_RT) || defined(FREEBSD_386) || defined(IBM_AIX) || defined(NETBSD) || defined(OPENBSD) || defined(DARWIN)
#define USE_IOCTL_INSTEAD_OF_TERMIOS
#define USE_SGTTY
#endif

#if !defined(SUN_SPARC_SUNOS) && !defined(SUN3) && !defined(ULTRIX_MIPS) && !defined(LINUX_386) && !defined(NEXT) && !defined(IBM_RT) && !defined(IBM_AIX)
#define HAVE_TPARM      /* define if this system has the tparm routine */
#endif

#if defined(SUN_SPARC_SUNOS) || defined(SUN_SPARC_SOLARIS) || defined(SUN3) || defined(SGI_IRIX) || defined(LINUX_386) || defined(IBM_RT) || defined(FREEBSD_386) || defined(IBM_AIX) || defined(NETBSD) || defined(OPENBSD) || defined(DARWIN)
#define OS_USHORT_DEFINED
#endif

#if defined(SUN_SPARC_SUNOS) || defined(SUN_SPARC_SOLARIS) || defined(SUN3) || defined(SGI_IRIX) || defined(LINUX_386) || defined(FREEBSD_386) || defined(IBM_AIX) || defined(NETBSD) || defined(OPENBSD) || defined(DARWIN)
#define OS_UINT_DEFINED
#endif

#if defined(SGI_IRIX) || defined(LINUX_386) || defined(SUN_SPARC_SOLARIS) || defined(IBM_AIX) || defined(NETBSD) || defined(OPENBSD)
#define OS_ULONG_DEFINED
#endif

#if defined(SGI_IRIX) || defined(LINUX_386) || defined(IBM_AIX)
#define TERMIOS_IS_NOT_IN_SYS
#endif

#define remove(filename) unlink(filename)

/*
 * Some systems have stricmp; some have strcasecmp
 */
#ifdef HAVE_STRCASECMP
#define strnicmp strncasecmp
#define stricmp strcasecmp
#endif


/* far pointer type qualifier (null on most platforms) */
#  define osfar_t

/* maximum theoretical size of malloc argument */
#  define OSMALMAX (0xffffffffL)

/* cast an expression to void */
#  define DISCARD (void)

#if !defined(IBM_RT)
#include <stdlib.h>
#endif
#include <stdio.h>
#if !defined(NEXT) && !defined(IBM_RT)
#include <unistd.h>
#endif
#if !defined(IBM_RT)
#include <memory.h>
#endif

#if defined(IBM_RT)
#define SEEK_SET 0
#define SEEK_CUR 1
#define SEEK_END 2
#endif

/*
 * Need to strip off b's from fopen calls.
 *
 * (DBJ: changed so that this is only done for non-standard compilers)
 */
#if !defined(__STDC__)
FILE* our_fopen(char *filename, char *flags);
#define fopen our_fopen
#endif

/*
 * Some machines are missing memmove, so we use our own memcpy/memmove 
 * routine instead.
 */
//void *our_memcpy(void *dst, const void *src, size_t size); 
//#define memcpy our_memcpy
//#define memmove our_memcpy

/* display lines on which errors occur */
/* #  define OS_ERRLINE 1 */

/*
 *   If long cache-manager macros are NOT allowed, define
 *   OS_MCM_NO_MACRO.  This forces certain cache manager operations to be
 *   functions, which results in substantial memory savings.  
 */
/* #define OS_MCM_NO_MACRO */

/* likewise for the error handling subsystem */
/* #define OS_ERR_NO_MACRO */

/*
 *   If error messages are to be included in the executable, define
 *   OS_ERR_LINK_MESSAGES.  Otherwise, they'll be read from an external
 *   file that is to be opened with oserrop().
 */
#define OS_ERR_LINK_MESSAGES
#define ERR_LINK_MESSAGES

/* round a size to worst-case alignment boundary */
#define osrndsz(s) (((s)+3) & ~3)

/* round a pointer to worst-case alignment boundary */
#define osrndpt(p) ((uchar *)((((ulong)(p)) + 3) & ~3))

#if     defined(DJGCC_386)
/* DBJ: maybe this should be a test for endian-ness, not for a
 * very rare compiler.
 */

/* read unaligned portable 2-byte value, returning int */
#define osrp2(p) (*(unsigned short *)(p))

/* read unaligned portable signed 2-byte value, returning int */
#define osrp2s(p) ((int)*(short *)(p))

/* write int to unaligned portable 2-byte value */
#define oswp2(p, i) (*(unsigned short *)(p)=(i))

/* read unaligned portable 4-byte value, returning long */
#define osrp4(p) (*(long *)(p))

/* write long to unaligned portable 4-byte value */
#define oswp4(p, l) (*(long *)(p)=(l))

#else   /* defined(DJGCC_386) */

/* service macros for osrp2 etc. */
#define osc2u(p, i) ((uint)(((uchar *)(p))[i]))
#define osc2l(p, i) ((ulong)(((uchar *)(p))[i]))

/* read unaligned portable 2-byte value, returning int */
//#define osrp2(p) (osc2u(p, 0) + (osc2u(p, 1) << 8))

/* read unaligned portable 2-byte signed value, returning int */
//#define osrp2s(p) \
    (((int)(short)osc2u(p, 0)) + ((int)(short)(osc2u(p, 1) << 8)))

/* write int to unaligned portable 2-byte value */
#define oswp2(p, i) ((((uchar *)(p))[1] = (i)>>8), (((uchar *)(p))[0] = (i)&255))

/* read unaligned portable 4-byte value, returning long */
//#define osrp4(p) \
 (osc2l(p, 0) + (osc2l(p, 1) << 8) + (osc2l(p, 2) << 16) + (osc2l(p, 3) << 24))

/* write long to unaligned portable 4-byte value */
#define oswp4(p, i) \
 ((((uchar *)(p))[0] = (i)), (((uchar *)(p))[1] = (i)>>8),\
  (((uchar *)(p))[2] = (i)>>16, (((uchar *)(p))[3] = (i)>>24)))

#endif  /* defined(DJGCC_386) */

/* allocate storage - malloc where supported */
/* void *osmalloc(size_t siz); */
#define osmalloc malloc

/* free storage allocated with osmalloc */
/* void osfree(void *block); */
#define osfree free

/* reallocate storage */
void *osrealloc(void *buf, size_t len);

/* copy a structure - dst and src are structures, not pointers */
#define OSCPYSTRUCT(dst, src) ((dst) = (src))

/* maximum length of a filename */
#define OSFNMAX 1024

/* normal path separator character */
#define OSPATHCHAR '/'

/* alternate path separator characters */
#define OSPATHALT "/"

/* URL path separator */
#define OSPATHURL "/"

/* character to separate paths from one another */
#define OSPATHSEP ':'

#if !defined(ES6_FILE_BYPASS)
/* os file structure */
typedef FILE osfildef;
#endif

/* os file time structure */
struct os_file_time_t
{
    time_t t;
};

/* main program exit codes */
#define OSEXSUCC 0                                 /* successful completion */
#define OSEXFAIL 1                                        /* error occurred */

#if !defined(ES6_FILE_BYPASS)
/* open text file for reading; returns NULL on error */
/* osfildef *osfoprt(char *fname, int typ); */
#define osfoprt(fname, typ) fopen(fname, "r")

/* open text file for writing; returns NULL on error */
/* osfildef *osfopwt(char *fname, int typ); */
#define osfopwt(fname, typ) fopen(fname, "w")

/* open text file for reading/writing; don't truncate */
osfildef *osfoprwt(const char *fname, os_filetype_t typ);

/* open text file for reading/writing; truncate; returns NULL on error */
/* osfildef *osfoprwtt(char *fname, int typ); */
#define osfoprwtt(fname, typ) fopen(fname, "w+")

/* open binary file for writing; returns NULL on error */
/* osfildef *osfopwb(char *fname, int typ); */
#define osfopwb(fname, typ) fopen(fname, "wb")

/* open source file for reading */
/* osfildef *osfoprs(char *fname, int typ); */
#define osfoprs(fname, typ) osfoprt(fname, typ)

/* open binary file for reading; returns NULL on erorr */
/* osfildef *osfoprb(char *fname, int typ); */
#define osfoprb(fname, typ) fopen(fname, "rb")

/* get a line of text from a text file (fgets semantics) */
/* char *osfgets(char *buf, size_t len, osfildef *fp); */
#define osfgets(buf, len, fp) fgets(buf, len, fp)

/* open binary file for reading/writing; don't truncate */
osfildef *osfoprwb(const char *fname, os_filetype_t typ);

/* open binary file for reading/writing; truncate; returns NULL on error */
/* osfildef *osfoprwb(char *fname, int typ); */
#define osfoprwtb(fname, typ) fopen(fname, "w+b")

/* write bytes to file; TRUE ==> error */
/* int osfwb(osfildef *fp, uchar *buf, int bufl); */
#define osfwb(fp, buf, bufl) (fwrite(buf, bufl, 1, fp) != 1)

/* read bytes from file; TRUE ==> error */
/* int osfrb(osfildef *fp, uchar *buf, int bufl); */
#define osfrb(fp, buf, bufl) (fread(buf, bufl, 1, fp) != 1)

/* read bytes from file and return count; returns # bytes read, 0=error */
/* size_t osfrbc(osfildef *fp, uchar *buf, size_t bufl); */
#define osfrbc(fp, buf, bufl) (fread(buf, 1, bufl, fp))

/* get position in file */
/* long osfpos(osfildef *fp); */
#define osfpos(fp) ftell(fp)

/* seek position in file; TRUE ==> error */
/* int osfseek(osfildef *fp, long pos, int mode); */
#define osfseek(fp, pos, mode) fseek(fp, pos, mode)
#define OSFSK_SET  SEEK_SET
#define OSFSK_CUR  SEEK_CUR
#define OSFSK_END  SEEK_END

/* close a file */
/* void osfcls(osfildef *fp); */
#define osfcls(fp) fclose(fp)

/* delete a file - TRUE if error */
/* int osfdel(char *fname); */
#define osfdel(fname) remove(fname)

/* access a file - 0 if file exists */
/* int osfacc(char *fname) */
#define osfacc(fname) access(fname, 0)

/* get a character from a file */
/* int osfgetc(osfildef *fp); */
#define osfgetc(fp) fgetc(fp)

/* write a string to a file */
/* void osfputs(char *buf, osfildef *fp); */
#define osfputs(buf, fp) fputs(buf, fp)
#endif


/* ignore OS_LOADDS definitions */
# define OS_LOADDS

/* Show cursor as busy */
#define os_csr_busy(show_as_busy)

/* yield CPU; returns TRUE if user requested interrupt, FALSE to continue */
#define os_yield()  FALSE

/* update progress display with current info, if appropriate */
#define os_progress(fname, linenum)

#define os_tzset()

/*
 *   Single/double quote matching macros.  Used to allow systems with
 *   extended character codes with weird quote characters (such as Mac) to
 *   match the weird characters. 
 */
#define os_squote(c) ((c) == '\'')
#define os_dquote(c) ((c) == '"')
#define os_qmatch(a, b) ((a) == (b))

/*
 *   Options for this operating system
 */
# define USE_MORE        /* assume more-mode is desired (undef if not true) */
/* # define USEDOSCOMMON */
/* # define USE_OVWCHK */
/* # define USE_DOSEXT */
# define USE_NULLPAUSE
# define USE_TIMERAND
# define USE_NULLSTYPE
# define USE_PATHSEARCH
# define STD_OS_HILITE
# define STD_OSCLS


/*
 * Turning this off will enable termcap output.
 */
/* #define USE_STDIO */

#define USE_STDIO_INPDLG

//#ifdef  USE_STDIO
/* #  define USE_NULLINIT */
//#  define USE_NULLSTAT
//#  define USE_NULLSCORE
//#else   /* USE_STDIO */
//#  define RUNTIME
//#  define USE_FSDBUG
//#  define USE_STATLINE
//#  define USE_HISTORY
//#  define USE_SCROLLBACK
//#endif

#  ifdef USE_SCROLLBACK
#   define OS_SBSTAT "(Review Mode)  ^P=Up  ^N=Down  <=Page Up  \
>=Page Down  Esc=Exit"
#  endif /* USE_SCROLLBACK */

#  ifdef USE_HISTORY
#   define HISTBUFSIZE 4096
#  endif /* USE_HISTORY */

/*
 *   Some global variables needed for console implementation
 */
#  ifdef OSGEN_INIT
#   define E
#   define I(a) =(a)
#  else /* OSGEN_INIT */
#   define E extern
#   define I(a)
#  endif /* OSGEN_INIT */

E int status_mode;
E int sdesc_color I(23);
E int ldesc_color I(112);
E int debug_color I(0xe);

E int text_color I(7), text_bold_color I(15), text_normal_color I(7);

#  ifdef USE_GRAPH
void ossdsp();
E void (*os_dspptr)() I(ossdsp);
#   define ossdsp (*os_dspptr)
#  endif /* USE_GRAPH */

#  undef E
#  undef I

#endif /* OSUNIXT_INCLUDED */
