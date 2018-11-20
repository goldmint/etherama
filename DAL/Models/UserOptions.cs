using System.ComponentModel.DataAnnotations.Schema;
using Etherama.DAL.Models.Base;

namespace Etherama.DAL.Models {

	[Table("er_user_options")]
	public class UserOptions : DbBaseUserEntity {

		[Column("init_tfa_quest")]
		public bool InitialTfaQuest { get; set; }
	}
}
