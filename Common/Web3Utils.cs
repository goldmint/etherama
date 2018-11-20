using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Numerics;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Nethereum.Hex.HexTypes;
using Nethereum.JsonRpc.Client;
using Nethereum.RPC.Eth.DTOs;
using Nethereum.Util;
using Nethereum.Web3;

namespace Etherama.Common
{
    public class Web3Utils
    {
        private readonly string ERC20_ABI = "[{\"constant\":false,\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"approve\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"totalSupply\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"from\",\"type\":\"address\"},{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"transferFrom\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"who\",\"type\":\"address\"}],\"name\":\"balanceOf\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"to\",\"type\":\"address\"},{\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"transfer\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"name\":\"spender\",\"type\":\"address\"},{\"name\":\"value\",\"type\":\"uint256\"},{\"name\":\"extraData\",\"type\":\"bytes\"}],\"name\":\"approveAndCall\",\"outputs\":[{\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"name\":\"owner\",\"type\":\"address\"},{\"name\":\"spender\",\"type\":\"address\"}],\"name\":\"allowance\",\"outputs\":[{\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"type\":\"function\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"owner\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"spender\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Approval\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"name\":\"from\",\"type\":\"address\"},{\"indexed\":true,\"name\":\"to\",\"type\":\"address\"},{\"indexed\":false,\"name\":\"value\",\"type\":\"uint256\"}],\"name\":\"Transfer\",\"type\":\"event\"}]";

        private readonly Web3 _web3;

        public UnitConversion Convert => Web3.Convert;

        public Web3Utils(IClient provider)
        {
            _web3 = new Web3(provider);
        }

        public Web3Utils(string url)
        {
            _web3 = new Web3(url);
        }

        public string GetAddressFromPrivateKey(string privateKey)
        {
            return Web3.GetAddressFromPrivateKey(privateKey);
        }

        public async Task<double> GetEthBalance(string address, ulong? blockNumber = null)
        {
            _web3.Eth.DefaultBlock.SetValue(BlockParameter.BlockParameterType.latest);

            if (blockNumber.HasValue) _web3.Eth.DefaultBlock = new BlockParameter(blockNumber.Value);

            var balanceWei = (await _web3.Eth.GetBalance.SendRequestAsync(address)).Value;

            return (double)Web3.Convert.FromWei(balanceWei);
        }

        public async Task<double> GetTokenBalance(string tokenAddress, string ofAddress, ulong? blockNumber = null)
        {
            _web3.Eth.DefaultBlock.SetValue(BlockParameter.BlockParameterType.latest);

            if (string.IsNullOrEmpty(tokenAddress)) return await GetEthBalance(ofAddress, blockNumber);

            if (blockNumber.HasValue) _web3.Eth.DefaultBlock = new BlockParameter(blockNumber.Value);

            var contract = _web3.Eth.GetContract(ERC20_ABI, tokenAddress);
            var func = contract.GetFunction("balanceOf");

            var balanceWei = await func.CallAsync<BigInteger>(ofAddress);

            return (double)Web3.Convert.FromWei(balanceWei);
        }

        public async Task<string> SendTokensToAddress(string tokenAddress, string fromPrivateKey, string toAddress, double? amountWei = null)
        {
            var fromAddress = GetAddressFromPrivateKey(fromPrivateKey);

            var balanceWei = (double)Convert.ToWei(await GetTokenBalance(tokenAddress, fromAddress));
            if (!amountWei.HasValue) amountWei = balanceWei;

            if (balanceWei < amountWei) throw new CustomException($"Token [{tokenAddress}] balance of the address [{fromAddress}] is less than required: {balanceWei} > {amountWei}");

            var contract = _web3.Eth.GetContract(ERC20_ABI, tokenAddress);
            var func = contract.GetFunction("transfer");

            var requiredGas = await func.EstimateGasAsync(toAddress, amountWei);
            var gasPrice = await _web3.Eth.GasPrice.SendRequestAsync();
            var gasWei = requiredGas.Value * gasPrice.Value;

            var ethBalance = Convert.ToWei(await GetEthBalance(fromAddress));

            if (ethBalance > gasWei) throw new CustomException($"The address [{fromAddress}] doesn't contain enough gas to make a transfer transaction");

            var txCount = await _web3.Eth.Transactions.GetTransactionCount.SendRequestAsync(fromAddress);

            var encoded = Web3.OfflineTransactionSigner.SignTransaction(fromPrivateKey, tokenAddress, 0, txCount.Value, gasPrice.Value, requiredGas.Value, func.GetData(fromAddress, amountWei));

            var txid = await _web3.Eth.Transactions.SendRawTransaction.SendRequestAsync("0x" + encoded);

            return txid;
        }

        public async Task<string> SendEthToAddress(string fromPrivateKey, string toAddress, double minBalance = 0, double? amountWei = null)
        {
            if (minBalance < 0) minBalance = 0;
            if (amountWei < 0) amountWei = null;

            var minBalanceWei = (double)Convert.ToWei(minBalance);

            var fromAddress = GetAddressFromPrivateKey(fromPrivateKey);

            var gasPrice = (double)(await _web3.Eth.GasPrice.SendRequestAsync()).Value;
            var gasLimit = 21000;
            var gasWei = gasPrice * gasLimit;

            var balanceWei = (double)Convert.ToWei(await GetEthBalance(fromAddress)) - minBalanceWei;

            if (balanceWei <= minBalanceWei) return null;

            if (!amountWei.HasValue) amountWei = balanceWei - gasWei;

            if (balanceWei < amountWei + gasWei) throw new CustomException($"ETH balance of the address [{fromAddress}] is less than required: {balanceWei} > {amountWei}");

            var txCount = await _web3.Eth.Transactions.GetTransactionCount.SendRequestAsync(fromAddress);

            var encoded = Web3.OfflineTransactionSigner.SignTransaction(fromPrivateKey, toAddress, new BigInteger(amountWei.Value), txCount.Value, new BigInteger(gasPrice), new BigInteger(gasLimit));

            var txid = await _web3.Eth.Transactions.SendRawTransaction.SendRequestAsync("0x" + encoded);

            return txid;
        }

        public async Task<TransactionReceipt> GetTransactionInfo(string txid)
        {
            try
            {
                return await _web3.Eth.TransactionManager.TransactionReceiptService.PollForReceiptAsync(txid, new CancellationTokenSource(1000));
            }
            catch
            {
                return null;
            }
        }


        public async Task<T> GetViewFunctionResult<T>(string contractAddress, string contactAbi, string functionName, params object[] functionParams)
        {
            _web3.Eth.DefaultBlock.SetValue(BlockParameter.BlockParameterType.latest);

            var contract = _web3.Eth.GetContract(contactAbi, contractAddress);
            var func = contract.GetFunction(functionName);

            return await func.CallAsync<T>(functionParams);
        }

        public async Task<BigInteger> GetGasPrice()
        {
            return (await _web3.Eth.GasPrice.SendRequestAsync()).Value;
        }
    }
}
