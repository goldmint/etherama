namespace Etherama.Common {

	public sealed class AppConfig {

		public ConnectionStringsSection ConnectionStrings { get; set; } = new ConnectionStringsSection();
		public class ConnectionStringsSection {
			public string Default { get; set; } = "";
			public string Scanner { get; set; } = "";
		    public string CustodyBot { get; set; } = "";
        }

		// ---

		public AppsSection Apps { get; set; } = new AppsSection();

		public class AppsSection {

			public string RelativeApiPath { get; set; } = "/";

			public CabinetSection Cabinet { get; set; } = new CabinetSection();
			public DashboardSection Dashboard { get; set; } = new DashboardSection();

			// ---

			public class CabinetSection : BaseAppSection {

				public string RouteVerificationPage { get; set; } = "";
				public string RouteSignUpConfirmation { get; set; } = "";
				public string RoutePasswordRestoration { get; set; } = "";
				public string RouteEmailTaken { get; set; } = "";
				public string RouteOAuthTfaPage { get; set; } = "";
				public string RouteOAuthAuthorized { get; set; } = "";
				public string RouteDpaRequired { get; set; } = "";
				public string RouteDpaSigned { get; set; } = "";
			}

			public class DashboardSection : BaseAppSection {
			}

			public abstract class BaseAppSection {

				public string Url { get; set; } = "/";
			}
		}

		// ---

		public AuthSection Auth { get; set; } = new AuthSection();
		public class AuthSection {

			public JwtSection Jwt { get; set; } = new JwtSection();
			public class JwtSection {

				public string Issuer { get; set; } = "";
				public string Secret { get; set; } = "";
				public AudienceSection[] Audiences { get; set; } = new AudienceSection[0];

				public class AudienceSection {
					public string Audience { get; set; } = "";
					public long ExpirationSec { get; set; } = 1800;
				}
			}

			public string TwoFactorIssuer { get; set; } = "etherama.io";

			public FacebookSection Facebook { get; set; } = new FacebookSection();
			public class FacebookSection {
				public string AppId { get; set; } = "";
				public string AppSecret { get; set; } = "";
			}

			public GoogleSection Google { get; set; } = new GoogleSection();
			public class GoogleSection {
				public string ClientId { get; set; } = "";
				public string ClientSecret { get; set; } = "";
			}

			public ZendeskSsoSection ZendeskSso { get; set; } = new ZendeskSsoSection();
			public class ZendeskSsoSection {
				public string JwtSecret { get; set; } = "";
			}
		}

		// ---

		public ServicesSection Services { get; set; } = new ServicesSection();
		public class ServicesSection {

			public GoogleSheetsSection GoogleSheets { get; set; } = null;
			public class GoogleSheetsSection {

				public string ClientSecret64 { get; set; } = "";
				public string SheetId { get; set; } = "";
			}

			public RecaptchaSection Recaptcha { get; set; } = new RecaptchaSection();
			public class RecaptchaSection {

				public string SiteKey { get; set; } = "";
				public string SecretKey { get; set; } = "";
			}

			public MailGunSection MailGun { get; set; } = new MailGunSection();
			public class MailGunSection {

				public string Url { get; set; } = "";
				public string DomainName { get; set; } = "";
				public string Key { get; set; } = "";
				public string Sender { get; set; } = "";
			}

			public ShuftiProSection ShuftiPro { get; set; } = new ShuftiProSection();
			public class ShuftiProSection {
			
				public string ClientId { get; set; } = "";
				public string ClientSecret { get; set; } = "";
				public string CallbackSecret { get; set; } = "";
			}


			public EthereumSection Ethereum { get; set; } = new EthereumSection();
			public class EthereumSection {

				public string EtheramaContractAbi { get; set; } = "";
                public string EtheramaTokenPriceFucntionName { get; set; } = "";


                public string EtherscanTxView { get; set; } = "";
				public string Provider { get; set; } = "";
				public string LogsProvider { get; set; } = "";
			}

			public IpfsSection Ipfs { get; set; } = new IpfsSection();
			public class IpfsSection {

				public string Url { get; set; } = "";
			}

			public WorkersSection Workers { get; set; } = new WorkersSection();
			public class WorkersSection {

				public DbWorkerSettings Notifications { get; set; } = new DbWorkerSettings();
				public EthWorkerSettings EthEventsHarvester { get; set; } = new EthWorkerSettings();
				public EthWorkerSettings EthereumOperations { get; set; } = new EthWorkerSettings();
				public WorkerSettings GoldRateUpdater { get; set; } = new WorkerSettings();
				public WorkerSettings CryptoRateUpdater { get; set; } = new WorkerSettings();
				public WorkerSettings TelemetryAggregator { get; set; } = new WorkerSettings();
				public DbWorkerSettings CcPaymentProcessor { get; set; } = new DbWorkerSettings();
				public EthWorkerSettings EthTokenMigration { get; set; } = new EthWorkerSettings();
				public DbWorkerSettings SumusTokenMigration { get; set; } = new DbWorkerSettings();

				public class WorkerSettings {
					public int PeriodSec { get; set; } = 60;
				}

				public class DbWorkerSettings : WorkerSettings {
					public int ItemsPerRound { get; set; } = 50;
				}

				public class EthWorkerSettings : DbWorkerSettings {
					public int EthConfirmations { get; set; } = 30;
				}
			}
		}

	}
}
