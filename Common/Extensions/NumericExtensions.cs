using System.Numerics;

namespace Etherama.Common.Extensions {

	public static class NumericExtensions {

		public static decimal FromEther(this BigInteger v) {
			return (decimal) v / (decimal)BigInteger.Pow(10, TokensPrecision.Ethereum);
		}

		public static BigInteger ToEther(this decimal v) {
			return new BigInteger(decimal.Floor(v * (decimal) BigInteger.Pow(10, TokensPrecision.Ethereum)));
		}
	}
}
