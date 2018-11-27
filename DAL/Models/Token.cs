using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Etherama.DAL.Models.Base;

namespace Etherama.DAL.Models
{
    [Table("er_token")]
    public class Token : DbBaseEntity
    {
        [Column("erc20_contract_address"), Required, MaxLength(43)]
        public string Erc20ContractAddress { get; set; }

        [Column("etherama_contract_address"), Required, MaxLength(43)]
        public string EtheramaContractAddress { get; set; }

        [Column("full_name"), Required, MaxLength(128)]
        public string FullName { get; set; }

        [Column("ticker"), Required, MaxLength(16)]
        public string Ticker { get; set; }

        [Column("description"), Required, MaxLength(1024)]
        public string Description { get; set; }

        [Column("time_created"), Required]
        public DateTime TimeCreated { get; set; }

        [Column("time_updated"), Required]
        public DateTime TimeUpdated { get; set; }
    }
}
