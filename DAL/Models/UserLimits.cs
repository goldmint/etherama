using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Etherama.DAL.Models.Base;

namespace Etherama.DAL.Models
{
	[Table("er_user_limits")]
	public class UserLimits : DbBaseUserEntity
	{
		[Column("eth_deposited")]
		public decimal EthDeposited { get; set; }

		[Column("eth_withdrawn")]
		public decimal EthWithdrawn { get; set; }

		[Column("fiat_deposited")]
		public long FiatDeposited { get; set; }

		[Column("fiat_withdrawn")]
		public long FiatWithdrawn { get; set; }

		[Column("time_created"), Required]
		public DateTime TimeCreated { get; set; }
	}
}
