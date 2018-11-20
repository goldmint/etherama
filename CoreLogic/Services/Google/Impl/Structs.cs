using System;
using System.Collections.Generic;
using System.Numerics;
using System.Text;

namespace Etherama.CoreLogic.Services.Google.Impl {

	public sealed class UserInfoCreate {

		public long UserId { get; set; }
		public string UserName { get; set; }
		public string FirstName { get; set; }
		public string LastName { get; set; }
		public string Birthday { get; set; }
		public string Country { get; set; }
	}

	public sealed class UserInfoGoldUpdate {

		public long UserId { get; set; }
		public double GoldBoughtDelta { get; set; }
		public double GoldSoldDelta { get; set; }
	}
}
