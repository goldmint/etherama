namespace Etherama.WebApplication.Core.Response
{

	public enum APIErrorCode
	{

		/* [1..500] General errors, authorization */

		/// <summary>
		/// Just failure without any additional data
		/// </summary>
		InternalServerError = 1,

		/// <summary>
		/// Invalid request content type
		/// </summary>
		InvalidContentType = 2,

		/// <summary>
		/// Method not found
		/// </summary>
		MethodNotFound = 3,

		/// <summary>
		/// Unauthorized request, have to sign in first
		/// </summary>
		Unauthorized = 50,

		/// <summary>
		/// Invalid request parameter
		/// </summary>
		InvalidParameter = 100,

		/// <summary>
		/// Ownership lost / data has not been modified / somebody else modified data first
		/// </summary>
		OwnershipLost = 101,

		/// <summary>
		/// Operation has rate limit; wait before next attempt
		/// </summary>
		RateLimit = 102,
		
		/// <summary>
		/// Currently trading is not allowed
		/// </summary>
		TradingNotAllowed = 103,

		/// <summary>
		/// Exchange value requested is out of limits
		/// </summary>
		TradingExchangeLimit = 104,

	    /// <summary>
	    /// Duplicate migration request
	    /// </summary>
	    MigrationDuplicateRequest = 106,


        /* [501..599] PromoCodes errors */
        /// <summary>
        /// User did not enter promocode
        /// </summary>
        PromoCodeNotEnter = 501,

        /// <summary>
        /// PromoCode not found
        /// </summary>
        PromoCodeNotFound = 502,

        /// <summary>
        /// PromoCode has expired
        /// </summary>
        PromoCodeExpired = 503,

        /// <summary>
        /// PromoCode already used
        /// </summary>
        PromoCodeIsUsed = 504,

        /// <summary>
        /// PromoCode limit exceeded
        /// </summary>
        PromoCodeLimitExceeded = 505,

        /* [1000..1999] Account errors */

        /// <summary>
        /// Account not found
        /// </summary>
        AccountNotFound = 1000,

		/// <summary>
		/// Account locked (automatic lockout)
		/// </summary>
		AccountLocked = 1001,

		/// <summary>
		/// Email not confirmed
		/// </summary>
		AccountEmailNotConfirmed = 1002,

		/// <summary>
		/// Account must be verified before action
		/// </summary>
		AccountNotVerified = 1003,

		/// <summary>
		/// Specified email is already taken
		/// </summary>
		AccountEmailTaken = 1004,
	
		/*
		/// <summary>
		/// -
		/// </summary>
		- = 1005,

		/// <summary>
		/// -
		/// </summary>
		- = 1006,

		/// <summary>
		/// -
		/// </summary>
		- = 1007,

		/// <summary>
		/// -
		/// </summary>
		- = 1008,

		/// <summary>
		/// TFA must be enabled
		/// </summary>
		AccountTfaDisabled = 1009,

		/// <summary>
		/// User has pending operation. One of: buying, selling, deposit, withdraw, transfer, etc.
		/// </summary>
		AccountPendingBlockchainOperation = 1010,
		*/

		/// <summary>
		/// DPA is not signed
		/// </summary>
		AccountDpaNotSigned = 1011,
	}

	public static class APIErrorCodeExtensions {

		public static int ToIntCode(this APIErrorCode code) {
			return (int)code;
		}

		public static string ToDescription(this APIErrorCode code, string format = null, params object[] args) {
			return code.ToString() + (string.IsNullOrWhiteSpace(format) ? "" : ": " + string.Format(format, args));
		}
	}
}
