#include "os.h"
#include "lib.h"
#include <emscripten.h>

extern "C" {

int os_init(int *argc, char *argv[], const char *prompt,
        char *buf, int bufsiz)
{
    return (0);
}
void os_uninit() { }
void os_term(int rc) { }

int os_get_abs_filename(char *result_buf, size_t result_buf_size,
                        const char *filename)
{
	strncpy(result_buf, filename, result_buf_size);
	return 1;
}

char *os_strlwr(char *s) { return strlwr(s); }
int os_paramfile(char *buf) { return 0; }
int os_break(void) { return 0; }
void os_set_title(const char *title) {}

// Also needed os_gets, osfoprb

// Stub implementations

osfildef *osfoprwb(const char *fname, os_filetype_t typ)
{
	fprintf(stderr, "osfoprwb\n");
	return 0;
}

extern int js_getc(void);

int os_getc_raw(void)
{
	printf("os_getc_raw\n");
	return 0;
}

int os_getc(void)
{
//	printf("os_getc\n");
	int a = js_getc();
	return a;
}

void os_get_tmp_path(char *buf)
{
	printf("os_get_tmp_path\n");
	strcpy(buf, "");
}

// from osglk.c
void os_xlat_html4(unsigned int html4_char, char *result, size_t result_len)
{
    /* Return all standard Latin-1 characters as-is */
    if (html4_char <= 128 || (html4_char >= 160 && html4_char <= 255))
        result[0] = (unsigned char)html4_char;
    else {
        switch (html4_char) {
        case 130:                                      /* single back quote */
            result[0] = '`'; break;
        case 132:                                      /* double back quote */
            result[0] = '\"'; break;
        case 153:                                             /* trade mark */
            strcpy(result, "(tm)"); return;
        case 140:                                            /* OE ligature */
        case 338:                                            /* OE ligature */
            strcpy(result, "OE"); return;
        case 339:                                            /* oe ligature */
            strcpy(result, "oe"); return;
        case 159:                                                   /* Yuml */
            result[0] = 255;
        case 376:                                        /* Y with diaresis */
            result[0] = 'Y'; break;
        case 352:                                           /* S with caron */
            result[0] = 'S'; break;
        case 353:                                           /* s with caron */
            result[0] = 's'; break;
        case 150:                                                /* en dash */
        case 8211:                                               /* en dash */
            result[0] = '-'; break;
        case 151:                                                /* em dash */
        case 8212:                                               /* em dash */
            strcpy(result, "--"); return;
        case 145:                                      /* left single quote */
        case 8216:                                     /* left single quote */
            result[0] = '`'; break;
        case 146:                                     /* right single quote */
        case 8217:                                    /* right single quote */
        case 8218:                                    /* single low-9 quote */
            result[0] = '\''; break;
        case 147:                                      /* left double quote */
        case 148:                                     /* right double quote */
        case 8220:                                     /* left double quote */
        case 8221:                                    /* right double quote */
        case 8222:                                    /* double low-9 quote */
            result[0] = '\"'; break;
        case 8224:                                                /* dagger */
        case 8225:                                         /* double dagger */
        case 8240:                                        /* per mille sign */
            result[0] = ' '; break;
        case 139:                       /* single left-pointing angle quote */
        case 8249:                      /* single left-pointing angle quote */
            result[0] = '<'; break;
        case 155:                      /* single right-pointing angle quote */
        case 8250:                     /* single right-pointing angle quote */
            result[0] = '>'; break;
        case 8482:                                           /* small tilde */
            result[0] = '~'; break;
            
        default:
            /* unmappable character - return space */
            result[0] = (unsigned char)' ';
        }
    }
    result[1] = 0;
}

void os_advise_load_charmap(char *id, char *ldesc, char *sysinfo) 
{
	printf("os_advise_load_charmap\n");
}

void os_gen_charmap_filename(char *filename, char *internal_id,
                             char *argv0)
{
	printf("os_gen_charmap_filename\n");
	strcpy(filename, "");
}

void os_waitc(void)
{
	printf("os_waitc\n");
}

void os_sleep_ms(long delay_in_milliseconds)
{
	// Not valid if I'm not using the Emterpreter
	emscripten_sleep(delay_in_milliseconds);
}

long os_get_sys_clock_ms(void)
{
	printf("os_get_sys_clock_ms\n");
	return 0;
}

int os_is_file_in_dir(const char *filename, const char *path,
                      int include_subdirs, int match_self)
{
	printf("os_is_file_in_dir\n");
	return 0;
}

// Tries to find a game file at the end of the executable. Not used in js version.
osfildef *os_exeseek(const char *argv0, const char *typ)
{
	printf("os_exeseek\n");
	return 0;
}

extern int js_askfile(const char *prompt, char *fname_buf, int fname_len,
	int prompt_type, int file_type);

int os_askfile(const char *prompt, char *fname_buf, int fname_buf_len,
               int prompt_type, os_filetype_t file_type)
{
	if (js_askfile(prompt, fname_buf, fname_buf_len, prompt_type, file_type))
		return OS_AFE_SUCCESS;
	return OS_AFE_FAILURE;
}


#ifndef RUNTIME
void os_banner_set_attr(void *banner_handle, int attr)
{
}
#endif

/* Taken from osunixt.c */
void *osrealloc(void *buf, size_t len)
{
    return realloc(buf, len);
}

// from osglk.c
int os_get_exe_filename(char *buf, size_t buflen, const char *argv0)
{
    buf[0] = 0;
    return FALSE;
}




//**********************************************************************
// The code below is taken from osgen3.c

extern void js_printz(const char *s);

EM_JS(void, async_printz, (const char *s), {
  var str = UTF8ToString(s);
  Asyncify.handleSleep(function(wakeUp) {
 	postMessage({type: 'printz', str: str});
	restartFunc = wakeUp;
  });
});

/* 
 *   os_printz works just like fputs() to stdout: we write a null-terminated
 *   string to the standard output.  
 */
void os_printz(const char *str)
{
	async_printz(str);
//    fputs(str, stdout);
}


/*
 *   os_puts works like fputs() to stdout, except that we are given a
 *   separate length, and the string might not be null-terminated 
 */
void os_print(const char *str, size_t len)
{
	char* strz = (char *)malloc(len + 100);
    sprintf(strz, "%.*s", (int)len, str);
	js_printz(strz);
	free(strz);
}

/*
 *   os_flush forces output of anything buffered for standard output.  It
 *   is generally used prior to waiting for a key (so the normal flushing
 *   may not occur, as it does when asking for a line of input).  
 */
void os_flush(void)
{
    fflush(stdout);
}

/* 
 *   update the display - since we're using text mode, there's nothing we
 *   need to do 
 */
void os_update_display(void)
{
}

extern void js_gets(char *s, size_t bufl);

/*
 *   os_gets performs the same function as gets().  It should get a
 *   string from the keyboard, echoing it and allowing any editing
 *   appropriate to the system, and return the null-terminated string as
 *   the function's value.  The closing newline should NOT be included in
 *   the string.  
 */
uchar *os_gets(uchar *s, size_t bufl)
{
    /* make sure everything we've displayed so far is actually displayed */
    fflush(stdout);

    /* get a line of input from the standard input */
	js_gets((char *)s, bufl);
	
	return s;
}

/*
 *   The default stdio implementation does not support reading a line of
 *   text with timeout.  
 */
int os_gets_timeout(unsigned char *buf, size_t bufl,
                    unsigned long timeout, int resume_editing)
{
    /* tell the caller this operation is not supported */
    return OS_EVT_NOTIMEOUT;
}

/* 
 *   since we don't support os_gets_timeout(), we don't need to do anything
 *   in the cancel routine
 */
void os_gets_cancel(int reset)
{
    /* os_gets_timeout doesn't do anything, so neither do we */
}

/*
 *   Get an event - stdio version.  This version does not accept a timeout
 *   value, and can only get a keystroke.  
 */
int os_get_event(unsigned long timeout, int use_timeout,
                 os_event_info_t *info)
{
    /* if there's a timeout, return an error indicating we don't allow it */
    if (use_timeout)
        return OS_EVT_NOTIMEOUT;

    /* get a key the normal way */
    info->key[0] = os_getc();

    /* if it's an extended key, get the other key */
    if (info->key[0] == 0)
    {
        /* get the extended key code */
        info->key[1] = os_getc();

        /* if it's EOF, return an EOF event rather than a key event */
        if (info->key[1] == CMD_EOF)
            return OS_EVT_EOF;
    }

    /* return the keyboard event */
    return OS_EVT_KEY;
}



//****************************
// html-tads stuff

extern void js_start_html(void);
void os_start_html(void)
{
	js_start_html();
}

extern void js_end_html(void);
void os_end_html(void)
{
	js_end_html();
}

extern void js_more_prompt(void);
void os_more_prompt(void)
{
	js_more_prompt();
}

extern void js_plain(void);
void os_plain(void) 
{
	js_plain();
}

extern void js_status(int stat);
void os_status(int stat)
{
	js_status(stat);
}

extern int js_get_status(void);
int os_get_status()
{
	return js_get_status();
}

extern int js_score(int cur, int turncount);
void os_score(int cur, int turncount)
{
	js_score(cur, turncount);
}

extern void js_strsc(const char *p);
void os_strsc(const char *p)
{
	js_strsc(p);
}




//************************
// File stuff (some stuff taken from osunixt.h)

extern int js_openfile(const char *fname);
extern int js_openTempFileForWriting(const char *fname);
extern long js_ftell(int id);
extern int js_fread(void * ptr, int elSize, int numEl, int id);
extern int js_fwrite(void * ptr, int elSize, int numEl, int id);
extern void js_fclose(int id);
extern void js_ftransferToMainThread(int id);
extern int js_fseek(int id, long offset, int mode);


struct EsFileProxy
{
	bool isPosixFile;  // POSIX file or ES6 in-memory file
	int inMemoryId;    // If using in-memory file, this is the file id to access it
	FILE *fptr;
	bool transferWhenClosed;  // Transfer contents of file to main thread when it is closed (i.e. when writing to it is finished)
};

static osfildef* wrapFile(FILE *fptr)
{
	if (fptr == NULL) return NULL;
	struct EsFileProxy *fileProxy = new EsFileProxy();
	fileProxy->isPosixFile = true;
	fileProxy->fptr = fptr;
	return fileProxy;
}

int osfflush(osfildef *fp)
{
	if (fp->isPosixFile)
		return fflush(fp->fptr);
//	else
//		return (js_fwrite(buf, bufl, 1, fp->inMemoryId) != 1);
	return true;
}

/* just stubbed out for now */
int osfmode(const char *fname, int follow_links,
            unsigned long *mode, unsigned long *attrs)
{
	fprintf(stderr, "osfmode: %s\n", fname);
	return FALSE;
}

/* open text file for reading; returns NULL on error */
osfildef *osfoprt(char *fname, int typ)
{
	// Used for reading script files
	fprintf(stderr, "osfoptr: %s\n", fname);
	return wrapFile(fopen(fname, "r"));
}

/* open text file for writing; returns NULL on error */
osfildef *osfopwt(const char *fname, int typ)
{
	fprintf(stderr, "osfopwt: %s\n", fname);
	return wrapFile(fopen(fname, "w"));
}

/* open text file for reading/writing; don't truncate */
osfildef *osfoprwt(const char *fname, os_filetype_t typ)
{
	fprintf(stderr, "osfoprwt not implemented: %s\n", fname);
	return wrapFile(fopen(fname, "r+"));
}

/* open text file for reading/writing; truncate; returns NULL on error */
osfildef *osfoprwtt(char *fname, int typ)
{
	fprintf(stderr, "osfoprwtt: %s\n", fname);
	return wrapFile(fopen(fname, "w+"));
}

/* open binary file for writing; returns NULL on error */
osfildef *osfopwb(const char *fname, int typ)
{
	if (typ == OSFTSAVE && strcmp(fname, "?save1.sav") == 0)
	{
		// Special handling of saving a game
		int id = js_openTempFileForWriting(fname);
		if (id < 0)
			return NULL;
		EsFileProxy *fileProxy = new EsFileProxy();
		fileProxy->isPosixFile = false;
		fileProxy->fptr = 0;
		fileProxy->inMemoryId = id;
		fileProxy->transferWhenClosed = true;
		return fileProxy;
	}
	fprintf(stderr, "osfopwb: %s\n", fname);
	return wrapFile(fopen(fname, "wb"));
}

/* open source file for reading */
osfildef *osfoprs(char *fname, int typ)
{
	fprintf(stderr, "osfoprs: %s\n", fname);
	return osfoprt(fname, typ);
}

/* open binary file for reading; returns NULL on error */
osfildef *osfoprb(const char *fname, int typ)
{
//	fprintf(stderr, "osfoprb: %s\n", fname);
	// TADS 3 likes opening optional files. We'll intercept them here and reject it
	if (strcmp("T3_VM.msg", fname) == 0)
		return NULL; 
	if (strcmp("settings.txt", fname) == 0)
		return NULL; 
	int id = js_openfile(fname);
	if (id < 0)
		return NULL;
	EsFileProxy *fileProxy = new EsFileProxy();
	fileProxy->isPosixFile = false;
	fileProxy->fptr = 0;
	fileProxy->inMemoryId = id;
	fileProxy->transferWhenClosed = false;
	return fileProxy;
}

/* get a line of text from a text file (fgets semantics) */
char *osfgets(char *buf, size_t len, osfildef *fp)
{
	fprintf(stderr, "osfgets\n");
	return fgets(buf, len, fp->fptr);
}

/* open binary file for reading/writing; don't truncate */
osfildef *osfoprwb(const char *fname, os_filetype_t typ);

/* open binary file for reading/writing; truncate; returns NULL on error */
osfildef *osfoprwtb(const char *fname, int typ)
{
	if (typ == OSFTT3SAV && strcmp(fname, "?save1.sav") == 0)
	{
		// Special handling of saving a game
		int id = js_openTempFileForWriting(fname);
		if (id < 0)
			return NULL;
		EsFileProxy *fileProxy = new EsFileProxy();
		fileProxy->isPosixFile = false;
		fileProxy->fptr = 0;
		fileProxy->inMemoryId = id;
		fileProxy->transferWhenClosed = true;
		return fileProxy;
	}
	fprintf(stderr, "osfoprwtb: %s\n", fname);
	return wrapFile(fopen(fname, "w+b"));
}

/* write bytes to file; TRUE ==> error */
int osfwb_uchar(osfildef *fp, uchar *buf, int bufl)
{
	if (fp->isPosixFile)
		return (fwrite(buf, bufl, 1, fp->fptr) != 1);
	else
		return (js_fwrite(buf, bufl, 1, fp->inMemoryId) != 1);
	fprintf(stderr, "osfwb\n");
}

/* read bytes from file; TRUE ==> error */
int osfrb_uchar(osfildef *fp, uchar *buf, int bufl)
{
//	fprintf(stderr, "osfrb\n");
	if (fp->isPosixFile)
		return (fread(buf, bufl, 1, fp->fptr) != 1);
	else
		return (js_fread(buf, bufl, 1, fp->inMemoryId) != 1);
}

/* read bytes from file and return count; returns # bytes read, 0=error */
size_t osfrbc_uchar(osfildef *fp, uchar *buf, size_t bufl)
{
	fprintf(stderr, "osfrbc\n");
	return (fread(buf, 1, bufl, fp->fptr));
}

/* get position in file */
long osfpos(osfildef *fp)
{
//	fprintf(stderr, "osfpos\n");
	if (fp->isPosixFile)
		return ftell(fp->fptr);
	else
		return js_ftell(fp->inMemoryId);
}

/* seek position in file; TRUE ==> error */
int osfseek(osfildef *fp, long pos, int mode)
{
//	fprintf(stderr, "osfseek\n");
	if (fp->isPosixFile)
		return fseek(fp->fptr, pos, mode);
	int jsFMode = 0;
	if (mode == OSFSK_SET) 
		jsFMode = -1;
	else if (mode == OSFSK_END)
		jsFMode = 1;
	return js_fseek(fp->inMemoryId, pos, jsFMode);
}

/* close a file */
void osfcls(osfildef *fp)
{
	if (fp->isPosixFile)
		fclose(fp->fptr);
	else
	{
		if (fp->transferWhenClosed)
			js_ftransferToMainThread(fp->inMemoryId);
		js_fclose(fp->inMemoryId);
	
	}
	delete fp;
}

/* delete a file - TRUE if error */
int osfdel(const char *fname)
{
	return remove(fname);
}

/* access a file - 0 if file exists */
int osfacc(const char *fname)
{
	fprintf(stderr, "osfaccc %s\n", fname);
	if (strcmp("game.gam", fname) == 0)
		return F_OK | R_OK; 
	return access(fname, 0);
}

/* get a character from a file */
int osfgetc(osfildef *fp)
{
	fprintf(stderr, "osfgetc\n");
	return fgetc(fp->fptr);
}

/* write a string to a file */
int osfputs(char *buf, osfildef *fp)
{
	fprintf(stderr, "osfputs\n");
	fputs(buf, fp->fptr);
}
void os_fprintz(osfildef *fp, const char *str)
{
	if (fp->isPosixFile)
		fprintf(fp->fptr, "%s", str);
	else
		fprintf(stderr, "os_fprintz not implemented\n");
}

void os_fprint(osfildef *fp, const char *str, size_t len)
{
	if (fp->isPosixFile)
    	fprintf(fp->fptr, "%.*s", (int)len, str);
	else
		fprintf(stderr, "os_fprint not implemented\n");
}

/* Unimplemented */
int os_rename_file(const char *oldname, const char *newname)
{
	fprintf(stderr, "os_rename_file unimplemented\n");
	return FALSE;
}

int os_open_dir(const char *dirname, /*OUT*/osdirhdl_t *handle)
{
	fprintf(stderr, "os_open_dir unimplemented\n");
	return FALSE;
}

int os_read_dir(osdirhdl_t handle, char *fname, size_t fname_size)
{
	fprintf(stderr, "os_read_dir unimplemented\n");
	return FALSE;
}

void os_close_dir(osdirhdl_t handle)
{
	fprintf(stderr, "os_close_dir unimplemented\n");
}

int os_mkdir(const char *dir, int create_parents)
{
	fprintf(stderr, "os_mkdir unimplemented\n");
	return FALSE;
}

int os_rmdir(const char *dir)
{
	fprintf(stderr, "os_rmdir unimplemented\n");
	return FALSE;
}
int os_file_stat(const char *fname, int follow_links, os_file_stat_t *s)
{
	fprintf(stderr, "os_file_stat unimplemented\n");
	return FALSE;
}

void os_get_charmap(char *mapname, int charmap_id)
{
	fprintf(stderr, "os_get_charmap unimplemented\n");
    strcpy(mapname, "UTF-8");
}

void os_get_special_path(char *buf, size_t buflen, const char *argv0, int id)
{
	strcpy(buf, "");
	fprintf(stderr, "os_get_special_path unimplemented\n");
}

enum os_specfile_t os_is_special_file(const char *fname)
{
	fprintf(stderr, "os_is_special_file unimplemented\n");
     return OS_SPECFILE_NONE;
}

int os_resolve_symlink(const char *fname, char *target, size_t target_size)
{
	fprintf(stderr, "os_resolve_symlink unimplemented\n");
    return FALSE;
}

size_t os_get_root_dirs(char *buf, size_t buflen)
{
	fprintf(stderr, "os_get_root_dirs unimplemented\n");
    return 0;
}

osfildef *osfdup(osfildef *orig, const char *mode)
{
	fprintf(stderr, "osfdup unimplemented\n");
    return 0;
}

void os_time_ns(os_time_t *seconds, long *nanoseconds)
{
	fprintf(stderr, "os_time_ns unimplemented\n");
}

void os_instbrk(int install)
{
	fprintf(stderr, "os_instbrk unimplemented\n");
}
int os_get_timezone_info(struct os_tzinfo_t *info)
{
	fprintf(stderr, "os_get_timezone_info unimplemented\n");
	return 0;
}
int os_get_zoneinfo_key(char *buf, size_t buflen)
{
	fprintf(stderr, "os_get_zoneinfo_key unimplemented\n");
	return FALSE;
}








} // extern "C"