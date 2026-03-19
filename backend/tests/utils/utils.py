from pwdlib import PasswordHash

def get_password_hash_test(password):
    return PasswordHash.recommended().hash(password)