# Fakito's Interactive Collection

:warning: **This project is under development**

This project consist of a ERC1155 Contract which allows to store and modify custom URIs for each token.
It works on top of a UUPS proxy pattern to allow to add further modifying logics. ERC1155 and UUPS contracts from OpenZeppelin are being used.

A token may be modifiable or not. As of now, only one modifying mechanism is implemented.

ERC1155 has been chosen since Fakito is looking to mint both 1/1 and multiple amount tokens.

Set-up with: 

```shell
npm install 
```

Run tests with:

```shell
npx hardhat test
```