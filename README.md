# Reqt

Just a bunch of request stuff I reuse (including error handling and the token refresh mechanism)

If you plan to use this, you should know:

- this is not a package
- no, I will not make it a package
- it was made FOR react (but you can modify it to work for whatever FE framework you use)
- this may or may not work out of the box, I am not testing it here in isolation, I just want to copy and paste from the files when I need to and tweak things
- the assumption is that your app uses HTTP-only cookies for storing the access and refresh token
- your API has proper response codes and structure similar to mine (see [types/requests.ts](./types/requests.ts))
- you are willing to do some code modification to make it work
