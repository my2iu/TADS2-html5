/*  Copyright (C) 1987, 1988 by Michael J. Roberts.  All Rights Reserved. */

/*
 * OS-dependent module for Unix and Termcap/Termio library.
 *
 * 29-Jan-93
 * Dave Baggett
 */

/*
 * Fri Jan 29 16:14:39 EST 1993
 * dmb@ai.mit.edu   Termcap version works.
 *
 * Thu Apr 22 01:58:07 EDT 1993
 * dmb@ai.mit.edu   Lots of little changes.  Incorporated NeXT, Linux,
 *          and DJGCC changes.
 *
 * Sat Jul 31 02:04:31 EDT 1993
 * dmb@ai.mit.edu   Many changes to improve screen update efficiency.
 *          Added unix_tc flag, set by compiler mainline,
 *          to disable termcap stuff and just run using stdio.
 *
 * Fri Oct 15 15:50:09 EDT 1993
 * dmb@ai.mit.edu   Changed punt() code to save game state.
 *
 * Mon Oct 25 16:39:57 EDT 1993
 * dmb@ai.mit.edu   Now use our own os_defext and os_remext.
 *
 */
#include <stdio.h>
#if !defined(SUN3)
#include <stddef.h>
#endif
#include <stdlib.h>
#include <ctype.h>
#include <string.h>
#include <sys/stat.h>
#include <unistd.h>          /* SRG added for usleep() and select() */
#include <sys/ioctl.h>       /* tril@igs.net added for TIOCGWINSZ */
#if defined(LINUX_386) || defined(FREEBSD_386)   /* tril@igs.net 2000/Aug/20 */
#include <sys/time.h>
#include <sys/types.h>
#endif

#ifdef  DJGCC_386
#include <pc.h>
#include <dos.h>
#include "biosvid.h"
#endif

#include "lib.h"
#include "osifctyp.h"
#include "osunixt.h"


long osrp4s(unsigned char *p)
{
 long val= ((long)osc2l(p, 0) + ((long)osc2l(p, 1) << 8) + ((long)osc2l(p, 2) << 16) + ((long)(char)osc2l(p, 3) << 24));
 return val;
}
 void oswp4s(unsigned char *p, long l)
 {
	oswp4(p,l);
 }
 
int osrp2(unsigned char *p)
{
	int val = (osc2u(p, 0) + (osc2u(p, 1) << 8));
	return val;
}

 int osrp2s(unsigned char *p)
 {
    int val = (((int)(short)osc2u(p, 0)) + ((int)(short)(osc2u(p, 1) << 8)));
	return val;

 }
 
  unsigned long osrp4(unsigned char *p)
  {
  unsigned long val = (osc2l(p, 0) + (osc2l(p, 1) << 8) + (osc2l(p, 2) << 16) + (osc2l(p, 3) << 24));
  return val;

  }


