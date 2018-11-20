using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Etherama.DAL.Models.Base;

namespace Etherama.DAL.Models
{
    [Table("er_token_statistics")]
    public class TokenStatistics : DbBaseEntity
    {
        [Column("token_id"), Required]
        public long TokenId { get; set; }

        [Column("date")]
        public DateTime Date { get; set; }

        [Column("price_eth")]
        public decimal PriceEth { get; set; }

        [ForeignKey(nameof(TokenId))]
        public virtual Token Token { get; set; }
    }
}
