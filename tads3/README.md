Unzip the tads3 source code in this directory. Then make the following changes:

- in vmtz.cpp, fix a problem with `tcur > 0` (change it to `dir > 0`?)
- in tct3stm.cpp, change `if (create_iter != VM_INVALID_PROP)` to `if (create_iter != reinterpret_cast<void*>(VM_INVALID_PROP))`
- in vmfilnam.cpp, around line 552, change `err_finally` to `err_finally_after_catch_disc`
- delete vmerr.h
