using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Etherama.DAL.Models.Base;

namespace Etherama.DAL.Models {

	[Table("er_banned_country")]
	public class BannedCountry : DbBaseUserEntity {

		[Column("code"), MaxLength(3), Required]
		public string Code { get; set; }

		[Column("comment"), MaxLength(512), Required]
		public string Comment { get; set; }

		[Column("time_created"), Required]
		public DateTime TimeCreated { get; set; }
	}
}
