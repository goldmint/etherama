using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Etherama.DAL.Models.Identity;

namespace Etherama.DAL.Models.Base
{
    public abstract class DbBaseUserEntity : DbBaseEntity
    {
        [Column("user_id"), Required]
        public long UserId { get; set; }

        [ForeignKey(nameof(UserId))]
        public virtual User User { get; set; }
    }
}
