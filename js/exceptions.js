const PREFIX = "Returned error: VM Exception while processing transaction: ";

async function tryCatch(promise, message) {
    try {
        await promise;
        throw null;
    }
    catch (error) {
        assert(error, "Expected an error but did not get one");
        // assert(error.message.startsWith(PREFIX + message), "Expected an error starting with '" + PREFIX + message + "' but got '" + error.message + "' instead");
        assert(error.message.includes(message), "Expected an error containing '" + message + "' but got '" + error.message + "' instead");
    }
};

module.exports = {
    catchRevertCheeksSet    : async function(promise) {await tryCatch(promise, "Buttholes: address must not already be set");},
    catchRevertButtholeAddress : async function(promise) {await tryCatch(promise, "Buttholes: address must be a butthole");},
    catchRevertButthole    : async function(promise) {await tryCatch(promise, "Buttholes: caller must be a butthole");},
    catchRevertPausable    : async function(promise) {await tryCatch(promise, "ERC721Pausable: token transfer while paused");},
    catchRevertPause       : async function(promise) {await tryCatch(promise, "ERC721PresetMinterPauserAutoId: must have pauser role to pause");},
    catchRevertUnpause     : async function(promise) {await tryCatch(promise, "ERC721PresetMinterPauserAutoId: must have pauser role to unpause");},
    catchRevertMinter      : async function(promise) {await tryCatch(promise, "ERC721PresetMinterPauserAutoId: must have minter role to mint");},
    catchOwnable           : async function(promise) {await tryCatch(promise, "Ownable: caller is not the owner");},

    //
    catchRevert            : async function(promise) {await tryCatch(promise, "revert"             );},
    // catchOwnable           : async function(promise) {await tryCatch(promise, "revert Ownable: caller is not the owner");},
    catchOutOfGas          : async function(promise) {await tryCatch(promise, "out of gas"         );},
    catchInvalidJump       : async function(promise) {await tryCatch(promise, "invalid JUMP"       );},
    catchInvalidOpcode     : async function(promise) {await tryCatch(promise, "invalid opcode"     );},
    catchStackOverflow     : async function(promise) {await tryCatch(promise, "stack overflow"     );},
    catchStackUnderflow    : async function(promise) {await tryCatch(promise, "stack underflow"    );},
    catchStaticStateChange : async function(promise) {await tryCatch(promise, "static state change");},
};