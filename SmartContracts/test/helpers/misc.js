
// init BigNumber
var unit = new BigNumber(Math.pow(10,18));

function diffWithGas(mustBe,diff){
     var gasFee = 12000000;
     return (diff>=mustBe) && (diff<=mustBe + gasFee);
}

function getContractAbi(contractName,cb){
     var file = './contracts/ICO.sol';

     fs.readFile(file, function(err, result){
          assert.equal(err,null);

          var source = result.toString();
          assert.notEqual(source.length,0);

          var output = solc.compile(source, 1);   // 1 activates the optimiser
          var abi = JSON.parse(output.contracts[contractName].interface);
          return cb(null,abi);
     });
}

function deployMntContract(data,cb){
     var file = './contracts/ICO.sol';
     var contractName = ':MNTP';


     fs.readFile(file, function(err, result){
          assert.equal(err,null);

          var source = result.toString();
          assert.notEqual(source.length,0);

          assert.equal(err,null);

          var output = solc.compile(source, 1); // 1 activates the optimiser

          //console.log('OUTPUT: ');
          //console.log(output.contracts);

          var abi = JSON.parse(output.contracts[contractName].interface);
          var bytecode = output.contracts[contractName].bytecode;
          var tempContract = web3.eth.contract(abi);

          var alreadyCalled = false;

          tempContract.new(
               {
                    from: creator, 
                    // should not exceed 5000000 for Kovan by default
                    gas: 4995000,
                    //gasPrice: 120000000000,
                    data: '0x' + bytecode
               }, 
               function(err, c){
                    if (alreadyCalled) return cb(null);
                    alreadyCalled = true;

                    assert.equal(err, null);

                    //console.log('TX HASH: ');
                    //console.log(c.transactionHash);
                    // TX can be processed in 1 minute or in 30 minutes...
                    // So we can not be sure on this -> result can be null.
                    web3.eth.getTransactionReceipt(c.transactionHash, function(err, result){
                         //console.log('RESULT: ');
                         //console.log(result);

                         assert.equal(err, null);
                         assert.notEqual(result, null);

                         mntContractAddress = result.contractAddress;
                         mntContract = web3.eth.contract(abi).at(mntContractAddress);

                         console.log('MNTP Contract address: ' + mntContractAddress);

                         if(!alreadyCalled){
                              alreadyCalled = true;

                              return cb(null);
                         }
                    });
               });
     });
}

function deployUnsoldContract(data,cb){
     var file = './contracts/ICO.sol';
     var contractName = ':GoldmintUnsold';

     fs.readFile(file, function(err, result){
          assert.equal(err,null);

          var source = result.toString();
          assert.notEqual(source.length,0);

          assert.equal(err,null);

          var output = solc.compile(source, 0); // 1 activates the optimiser

          //console.log('OUTPUT: ');
          //console.log(output.contracts);

          var abi = JSON.parse(output.contracts[contractName].interface);
          var bytecode = output.contracts[contractName].bytecode;
          var tempContract = web3.eth.contract(abi);

          var alreadyCalled = false;

          tempContract.new(
               unsoldTokensReward, // _teamAccountAddress 
               mntContractAddress,
               {
                    from: creator, 
                    // should not exceed 5000000 for Kovan by default
                    gas: 4995000,
                    //gasPrice: 120000000000,
                    data: '0x' + bytecode
               }, 
               function(err, c){
                    assert.equal(err, null);

                    console.log('TX HASH: ');
                    console.log(c.transactionHash);

                    // TX can be processed in 1 minute or in 30 minutes...
                    // So we can not be sure on this -> result can be null.
                    web3.eth.getTransactionReceipt(c.transactionHash, function(err, result){
                         //console.log('RESULT: ');
                         //console.log(result);

                         assert.equal(err, null);
                         assert.notEqual(result, null);

                         unsoldContractAddress = result.contractAddress;
                         unsoldContract = web3.eth.contract(abi).at(unsoldContractAddress);

                         console.log('Unsold Contract address: ');
                         console.log(unsoldContractAddress);

                         if(!alreadyCalled){
                              alreadyCalled = true;

                              return cb(null);
                         }
                    });
               });
     });
}

function deployFoundersVestingContract(data,cb){
     var file = './contracts/ICO.sol';
     var contractName = ':FoundersVesting';

     fs.readFile(file, function(err, result){
          assert.equal(err,null);

          var source = result.toString();
          assert.notEqual(source.length,0);

          assert.equal(err,null);

          var output = solc.compile(source, 0); // 1 activates the optimiser

          //console.log('OUTPUT: ');
          //console.log(output.contracts);

          var abi = JSON.parse(output.contracts[contractName].interface);
          var bytecode = output.contracts[contractName].bytecode;
          var tempContract = web3.eth.contract(abi);

          var alreadyCalled = false;

          tempContract.new(
               goldmintTeam,            // _teamAccountAddress 
               mntContractAddress,
               {
                    from: creator, 
                    // should not exceed 5000000 for Kovan by default
                    gas: 4995000,
                    //gasPrice: 120000000000,
                    data: '0x' + bytecode
               }, 
               function(err, c){
                    assert.equal(err, null);

                    console.log('TX HASH: ');
                    console.log(c.transactionHash);

                    // TX can be processed in 1 minute or in 30 minutes...
                    // So we can not be sure on this -> result can be null.
                    web3.eth.getTransactionReceipt(c.transactionHash, function(err, result){
                         //console.log('RESULT: ');
                         //console.log(result);

                         assert.equal(err, null);
                         assert.notEqual(result, null);

                         foundersVestingContractAddress = result.contractAddress;
                         foundersVestingContract = web3.eth.contract(abi).at(foundersVestingContractAddress);

                         console.log('Founders Vesting Contract address: ');
                         console.log(foundersVestingContractAddress);

                         if(!alreadyCalled){
                              alreadyCalled = true;

                              return cb(null);
                         }
                    });
               });
     });
}

function deployGoldmintContract(data,cb){
     var file = './contracts/ICO.sol';
     var contractName = ':Goldmint';

     fs.readFile(file, function(err, result){
          assert.equal(err,null);

          var source = result.toString();
          assert.notEqual(source.length,0);

          assert.equal(err,null);

          var output = solc.compile(source, 0); // 1 activates the optimiser

          //console.log('OUTPUT: ');
          //console.log(output.contracts);

          var abi = JSON.parse(output.contracts[contractName].interface);
          var bytecode = output.contracts[contractName].bytecode;
          var tempContract = web3.eth.contract(abi);

          var alreadyCalled = false;

          tempContract.new(
               tokenManager,
               ethRateChanger,
               tokenManager,  // _otherCurrenciesChecker
               mntContractAddress,
               unsoldContractAddress,
               foundersVestingContractAddress, // _foundersRewardsAccount 
               {
                    from: creator, 
                    // should not exceed 5000000 for Kovan by default
                    gas: 4995000,
                    //gasPrice: 120000000000,
                    data: '0x' + bytecode
               }, 
               function(err, c){
                    assert.equal(err, null);

                    console.log('TX HASH: ');
                    console.log(c.transactionHash);

                    // TX can be processed in 1 minute or in 30 minutes...
                    // So we can not be sure on this -> result can be null.
                    web3.eth.getTransactionReceipt(c.transactionHash, function(err, result){
                         //console.log('RESULT: ');
                         //console.log(result);

                         assert.equal(err, null);
                         assert.notEqual(result, null);

                         goldmintContractAddress = result.contractAddress;
                         goldmintContract = web3.eth.contract(abi).at(goldmintContractAddress);

                         console.log('Goldmint Contract address: ');
                         console.log(goldmintContractAddress);

                         if(!alreadyCalled){
                              alreadyCalled = true;

                              return cb(null);
                         }
                    });
               });
     });
}

function deployGoldFeeContract(data,cb){
     var file = './contracts/Goldmint.sol';
     var contractName = ':GoldFee';

     fs.readFile(file, function(err, result){
          assert.equal(err,null);

          var source = result.toString();
          assert.notEqual(source.length,0);

          assert.equal(err,null);
          
          var output = solc.compile(source, 0); // 1 activates the optimiser

          //console.log('OUTPUT: ');
          //console.log(output.contracts);

          var abi = JSON.parse(output.contracts[contractName].interface);
          var bytecode = output.contracts[contractName].bytecode;
          var tempContract = web3.eth.contract(abi);

          var alreadyCalled = false;

          tempContract.new(
               {
                    from: creator, 
                    // should not exceed 5000000 for Kovan by default
                    gas: 9995000000,
                    //gasPrice: 120000000000,
                    data: '0x' + bytecode
               }, 
               function(err, c){
                    assert.equal(err, null);

                    console.log('TX HASH: ');
                    console.log(c.transactionHash);

                    // TX can be processed in 1 minute or in 30 minutes...
                    // So we can not be sure on this -> result can be null.
                    web3.eth.getTransactionReceipt(c.transactionHash, function(err, result){
                         //console.log('RESULT: ');
                         //console.log(result);

                         assert.equal(err, null);
                         assert.notEqual(result, null);

                         goldFeeContractAddress = result.contractAddress;
                         goldFeeContract = web3.eth.contract(abi).at(goldFeeContractAddress);

                         console.log('Gold Fee Contract address: ');
                         console.log(goldFeeContractAddress);

                         if(!alreadyCalled){
                              alreadyCalled = true;

                              return cb(null);
                         }
                    });
               });
     });
}

function deployGoldIssueBurnFeeContract(data,cb){
     var file = './contracts/Storage.sol';
     var contractName = ':GoldIssueBurnFee';

     fs.readFile(file, function(err, result){
          assert.equal(err,null);

          var source = result.toString();
          assert.notEqual(source.length,0);

          assert.equal(err,null);

          var output = solc.compile(source, 0); // 1 activates the optimiser

          //console.log('OUTPUT: ');
          //console.log(output.contracts);

          var abi = JSON.parse(output.contracts[contractName].interface);
          var bytecode = output.contracts[contractName].bytecode;
          var tempContract = web3.eth.contract(abi);

          var alreadyCalled = false;

          tempContract.new(
               "12312312",    // goldmint fee account
               {
                    from: creator, 
                    // should not exceed 5000000 for Kovan by default
                    gas: 4995000,
                    //gasPrice: 120000000000,
                    data: '0x' + bytecode
               }, 
               function(err, c){
                    assert.equal(err, null);

                    console.log('TX HASH: ');
                    console.log(c.transactionHash);

                    // TX can be processed in 1 minute or in 30 minutes...
                    // So we can not be sure on this -> result can be null.
                    web3.eth.getTransactionReceipt(c.transactionHash, function(err, result){
                         //console.log('RESULT: ');
                         //console.log(result);

                         assert.equal(err, null);
                         assert.notEqual(result, null);

                         goldIssueBurnFeeContractAddress = result.contractAddress;
                         goldIssueBurnFeeContract = web3.eth.contract(abi).at(goldIssueBurnFeeContractAddress);

                         if(!alreadyCalled){
                              alreadyCalled = true;

                              return cb(null);
                         }
                    });
               });
     });
}

function deployMigrationContract(data,cb){
     var file = './contracts/Goldmint.sol';
     var contractName = ':GoldmintMigration';

     fs.readFile(file, function(err, result){
          assert.equal(err,null);

          var source = result.toString();
          assert.notEqual(source.length,0);

          assert.equal(err,null);

          var output = solc.compile(source, 0); // 1 activates the optimiser

          //console.log('OUTPUT: ');
          //console.log(output.contracts);

          var abi = JSON.parse(output.contracts[contractName].interface);
          var bytecode = output.contracts[contractName].bytecode;
          var tempContract = web3.eth.contract(abi);

          var alreadyCalled = false;

          tempContract.new(
               mntContractAddress,
               goldContractAddress,
               {
                    from: creator, 
                    // should not exceed 5000000 for Kovan by default
                    gas: 4995000,
                    //gasPrice: 120000000000,
                    data: '0x' + bytecode
               }, 
               function(err, c){
                    assert.equal(err, null);

                    console.log('TX HASH: ');
                    console.log(c.transactionHash);

                    // TX can be processed in 1 minute or in 30 minutes...
                    // So we can not be sure on this -> result can be null.
                    web3.eth.getTransactionReceipt(c.transactionHash, function(err, result){
                         //console.log('RESULT: ');
                         //console.log(result);

                         assert.equal(err, null);
                         assert.notEqual(result, null);

                         migrationContractAddress = result.contractAddress;
                         migrationContract = web3.eth.contract(abi).at(migrationContractAddress);

                         console.log('Migration Contract address: ');
                         console.log(migrationContractAddress);

                         if(!alreadyCalled){
                              alreadyCalled = true;

                              return cb(null);
                         }
                    });
               });
     });
}

function deployStorageContract(data,cb){
     var file = './contracts/Storage.sol';
     var contractName = ':Storage';

     fs.readFile(file, function(err, result){
          assert.equal(err,null);

          var source = result.toString();
          assert.notEqual(source.length,0);

          assert.equal(err,null);

          var output = solc.compile(source, 0); // 1 activates the optimiser

          //console.log('OUTPUT: ');
          //console.log(output.contracts);

          var abi = JSON.parse(output.contracts[contractName].interface);
          var bytecode = output.contracts[contractName].bytecode;
          var tempContract = web3.eth.contract(abi);

          var alreadyCalled = false;

          tempContract.new(
              {
                    from: creator, 
                    // should not exceed 5000000 for Kovan by default
                    gas: 9995000,
                    //gasPrice: 120000000000,
                    data: '0x' + bytecode
               }, 
               function(err, c){
                    assert.equal(err, null);

                    console.log('TX HASH: ');
                    console.log(c.transactionHash);

                    // TX can be processed in 1 minute or in 30 minutes...
                    // So we can not be sure on this -> result can be null.
                    web3.eth.getTransactionReceipt(c.transactionHash, function(err, result){
                         //console.log('RESULT: ');
                         //console.log(result);

                         assert.equal(err, null);
                         assert.notEqual(result, null);

                         storageContractAddress = result.contractAddress;
                         storageContract = web3.eth.contract(abi).at(storageContractAddress);

                         console.log('Storage Contract address: ');
                         console.log(storageContractAddress);

                         if(!alreadyCalled){
                              alreadyCalled = true;

                              return cb(null);
                         }
                    });
               });
     });
}


function deployStorageControllerContract(data,cb){
     var file = './contracts/Storage.sol';
     var contractName = ':StorageController';

     fs.readFile(file, function(err, result){
          assert.equal(err,null);

          var source = result.toString();
          assert.notEqual(source.length,0);

          assert.equal(err,null);

          var output = solc.compile(source, 0); // 1 activates the optimiser

          //console.log('OUTPUT: ');
          //console.log(output.contracts);

          var abi = JSON.parse(output.contracts[contractName].interface);
          var bytecode = output.contracts[contractName].bytecode;
          var tempContract = web3.eth.contract(abi);

          var alreadyCalled = false;

          tempContract.new(
               mntContractAddress,
               goldContractAddress,
               0,                   // create new storage
               goldIssueBurnFeeContractAddress,
               {
                    from: creator, 
                    // should not exceed 5000000 for Kovan by default
                    gas: 9995000,
                    //gasPrice: 120000000000,
                    data: '0x' + bytecode
               }, 
               function(err, c){
                    assert.equal(err, null);

                    console.log('TX HASH: ');
                    console.log(c.transactionHash);

                    // TX can be processed in 1 minute or in 30 minutes...
                    // So we can not be sure on this -> result can be null.
                    web3.eth.getTransactionReceipt(c.transactionHash, function(err, result){
                         //console.log('RESULT: ');
                         //console.log(result);

                         assert.equal(err, null);
                         assert.notEqual(result, null);

                         storageControllerContractAddress = result.contractAddress;
                         storageControllerContract = web3.eth.contract(abi).at(storageControllerContractAddress);

                         console.log('Storage Controller Contract address: ');
                         console.log(storageControllerContractAddress);

                         if(!alreadyCalled){
                              alreadyCalled = true;

                              return cb(null);
                         }
                    });
               });
     });
}

function deployGoldContract(data,cb){
     var file = './contracts/Goldmint.sol';
     var contractName = ':Gold';

     fs.readFile(file, function(err, result){
          assert.equal(err,null);

          var source = result.toString();
          assert.notEqual(source.length,0);

          assert.equal(err,null);

          var output = solc.compile(source, 0); // 1 activates the optimiser

          //console.log('OUTPUT: ');
          //console.log(output.contracts);

          var abi = JSON.parse(output.contracts[contractName].interface);
          var bytecode = output.contracts[contractName].bytecode;
          var tempContract = web3.eth.contract(abi);

          var alreadyCalled = false;

          tempContract.new(
               mntContractAddress,
               goldmintTeamAddress,
               goldFeeContractAddress,
               {
                    from: creator, 
                    // should not exceed 5000000 for Kovan by default
                    gas: 4995000,
                    data: '0x' + bytecode
               }, 
               function(err, c){
                    assert.equal(err, null);

                    console.log('TX HASH: ');
                    console.log(c.transactionHash);

                    // TX can be processed in 1 minute or in 30 minutes...
                    // So we can not be sure on this -> result can be null.
                    web3.eth.getTransactionReceipt(c.transactionHash, function(err, result){
                         //console.log('RESULT: ');
                         //console.log(result);

                         assert.equal(err, null);
                         assert.notEqual(result, null);

                         goldContractAddress = result.contractAddress;
                         goldContract = web3.eth.contract(abi).at(goldContractAddress);

                         console.log('GOLD Contract address: ');
                         console.log(goldContractAddress);

                         if(!alreadyCalled){
                              alreadyCalled = true;

                              return cb(null);
                         }
                    });
               });
     });
}


function deployEtheramaCore(data, cb) {
    var file = './contracts/Etherama.sol';
    var contractName = ':EtheramaCore';

    fs.readFile(file, function(err, result){
        assert.equal(err,null);

        var source = result.toString();
        assert.notEqual(source.length,0);

        assert.equal(err,null);

        var output = solc.compile(source, 1); // 1 activates the optimiser

        //console.log('OUTPUT: ');
        //console.log(output.contracts);

        var abi = JSON.parse(output.contracts[contractName].interface);
        var bytecode = output.contracts[contractName].bytecode;
        var tempContract = web3.eth.contract(abi);

        var alreadyCalled = false;

        tempContract.new(
            35000000000,
            {
                from: creator, 
                // should not exceed 5000000 for Kovan by default
                gas: 4995000,
                data: '0x' + bytecode
            }, 
            function(err, c){
               if (alreadyCalled) return cb(null);
               alreadyCalled = true;
                assert.equal(err, null);

                //console.log('TX HASH: ');
                //console.log(c.transactionHash);

                // TX can be processed in 1 minute or in 30 minutes...
                // So we can not be sure on this -> result can be null.
                web3.eth.getTransactionReceipt(c.transactionHash, function(err, result){
                        //console.log('RESULT: ');
                        //console.log(result);

                        assert.equal(err, null);
                        assert.notEqual(result, null);

                        coreContractAddress = result.contractAddress;
                        coreContract = web3.eth.contract(abi).at(coreContractAddress);

                        console.log('Core Contract address: ');
                        console.log(coreContractAddress);

                        if(!alreadyCalled){
                            alreadyCalled = true;

                            return cb(null);
                        }
                });
            });
    });    
}

function deployEtheramaDataContract(data,cb){
     var file = './contracts/Etherama.sol';
     var contractName = ':EtheramaData';

     fs.readFile(file, function(err, result){
          assert.equal(err,null);

          var source = result.toString();
          assert.notEqual(source.length,0);

          assert.equal(err,null);

          var output = solc.compile(source, 0); // 1 activates the optimiser

          //console.log('OUTPUT: ');
          //console.log(output.contracts);

          var abi = JSON.parse(output.contracts[contractName].interface);
          var bytecode = output.contracts[contractName].bytecode;
          var tempContract = web3.eth.contract(abi);

          var alreadyCalled = false;

          tempContract.new(
               coreContractAddress,
               {
                    from: creator, 
                    // should not exceed 5000000 for Kovan by default
                    gas: 1000000000,
                    data: '0x' + bytecode
               }, 
               function(err, c){
                    if (alreadyCalled) return cb(null);
                    alreadyCalled = true;
                    assert.equal(err, null);

                    console.log('TX HASH: ');
                    console.log(c.transactionHash);

                    // TX can be processed in 1 minute or in 30 minutes...
                    // So we can not be sure on this -> result can be null.
                    web3.eth.getTransactionReceipt(c.transactionHash, function(err, result){
                         //console.log('RESULT: ');
                         //console.log(result);

                         assert.equal(err, null);
                         assert.notEqual(result, null);

                         dataContractAddress = result.contractAddress;
                         dataContract = web3.eth.contract(abi).at(dataContractAddress);

                         console.log('Etherama Data Contract address: ');
                         console.log(dataContractAddress);

                         if(!alreadyCalled){
                              alreadyCalled = true;

                              return cb(null);
                         }
                    });
               });
     });
}

function deployEtheramaContract(data,cb){
     var file = './contracts/Etherama.sol';
     var contractName = ':Etherama';

     fs.readFile(file, function(err, result){
          assert.equal(err,null);

          var source = result.toString();
          assert.notEqual(source.length,0);

          assert.equal(err,null);

          var output = solc.compile(source, 1); // 1 activates the optimiser

          //console.log('OUTPUT: ');
          //console.log(output.contracts);

          var abi = JSON.parse(output.contracts[contractName].interface);
          var bytecode = output.contracts[contractName].bytecode;
          var tempContract = web3.eth.contract(abi);

          var alreadyCalled = false;

          tempContract.new(
               mntContractAddress,
               dataContractAddress,
               {
                    from: creator, 
                    // should not exceed 5000000 for Kovan by default
                    gas: 1000000000,
                    data: '0x' + bytecode
               }, 
               function(err, c){
                    if (alreadyCalled) return cb(null);
                    alreadyCalled = true;
                    assert.equal(err, null);

                    console.log('TX HASH: ');
                    console.log(c.transactionHash);

                    // TX can be processed in 1 minute or in 30 minutes...
                    // So we can not be sure on this -> result can be null.
                    web3.eth.getTransactionReceipt(c.transactionHash, function(err, result){
                         //console.log('RESULT: ');
                         //console.log(result);

                         assert.equal(err, null);
                         assert.notEqual(result, null);

                         mraContractAddress = result.contractAddress;
                         mraContract = web3.eth.contract(abi).at(mraContractAddress);

                         console.log('Etherama Contract address: ');
                         console.log(mraContractAddress);

                         if(!alreadyCalled){
                              alreadyCalled = true;

                              return cb(null);
                         }
                    });
               });
     });
}


function deployEtheramaPriceTestContract(data,cb){
    var file = './contracts/MintaramaPriceTest.sol';
    var contractName = ':MintaramaPriceTest';

    fs.readFile(file, function(err, result){
        assert.equal(err,null);

        var source = result.toString();
        assert.notEqual(source.length,0);

        assert.equal(err,null);

        var output = solc.compile(source, 0); // 1 activates the optimiser

        //console.log('OUTPUT: ');
        //console.log(output.contracts);

        var abi = JSON.parse(output.contracts[contractName].interface);
        var bytecode = output.contracts[contractName].bytecode;
        var tempContract = web3.eth.contract(abi);

        var alreadyCalled = false;

        tempContract.new(
            {
                from: creator, 
                // should not exceed 5000000 for Kovan by default
                gas: 4995000,
                data: '0x' + bytecode
            }, 
            function(err, c){
                assert.equal(err, null);

                console.log('TX HASH: ');
                console.log(c.transactionHash);

                // TX can be processed in 1 minute or in 30 minutes...
                // So we can not be sure on this -> result can be null.
                web3.eth.getTransactionReceipt(c.transactionHash, function(err, result){
                        //console.log('RESULT: ');
                        //console.log(result);

                        assert.equal(err, null);
                        assert.notEqual(result, null);

                        mptContractAddress = result.contractAddress;
                        mptContract = web3.eth.contract(abi).at(mptContractAddress);

                        console.log('MintaramaPriceTest Contract address: ');
                        console.log(mptContractAddress);

                        if(!alreadyCalled){
                            alreadyCalled = true;

                            return cb(null);
                        }
                });
            });
    });     
}