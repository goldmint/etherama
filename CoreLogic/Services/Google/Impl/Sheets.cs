using Etherama.Common;
using Google.Apis.Auth.OAuth2;
using Google.Apis.Sheets.v4;
using Google.Apis.Util.Store;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Etherama.Common.Extensions;
using Google.Apis.Auth.OAuth2.Flows;
using Google.Apis.Auth.OAuth2.Requests;
using Google.Apis.Services;
using Google.Apis.Sheets.v4.Data;
using NLog;

namespace Etherama.CoreLogic.Services.Google.Impl {

	public sealed class Sheets {

		private readonly AppConfig _appConfig;
		private readonly SheetsService _service;
		private readonly ILogger _logger;

		public Sheets(AppConfig appConfig, LogFactory logFactory) {
			_logger = logFactory.GetLoggerFor(this);
			ServiceAccountCredential credential;

			_appConfig = appConfig;

			using (var ms = new MemoryStream(Convert.FromBase64String(_appConfig.Services.GoogleSheets.ClientSecret64))) {
				string[] scopes = {
					SheetsService.Scope.Spreadsheets
				};
				credential = GoogleCredential.FromStream(ms).CreateScoped(scopes).UnderlyingCredential as ServiceAccountCredential;
			}

			var initializer = new BaseClientService.Initializer() {
				HttpClientInitializer = credential,
				ApplicationName = "Goldmint Backend",
				GZipEnabled = true,
			};

			_service = new SheetsService(initializer);
		}

		public async Task<bool> InsertUser(UserInfoCreate data) {
			try {
				var row = data.UserId + 1;
				string range = $"UserInfo!A{row}:H{row}";
				var requestBody = new ValueRange() {
					Values = new List<IList<object>>() {
						new List<object>() {
							data.UserId.ToString(), // A
							data.UserName,
							data.FirstName,
							data.LastName,
							data.Birthday,
							data.Country,
							"0",
							"0", // H
						},
					}
				};

				var request = _service.Spreadsheets.Values.Update(requestBody, _appConfig.Services.GoogleSheets.SheetId, range);
				request.ValueInputOption = SpreadsheetsResource.ValuesResource.UpdateRequest.ValueInputOptionEnum.RAW;
				await request.ExecuteAsync();

				return true;
			}
			catch (Exception e) {
				_logger.Error(e, $"Failed to insert user {data.UserId} into Google sheets");
			}
			return false;
		}

		public async Task<bool> UpdateUserGoldInfo(UserInfoGoldUpdate data) {

			try {
				var row = data.UserId + 1;
				string range = $"UserInfo!G{row}:H{row}";

				var getRequest = _service.Spreadsheets.Values.Get(_appConfig.Services.GoogleSheets.SheetId, range);
				var oldValues = await getRequest.ExecuteAsync();

				var totalBought = "0.0";
				var totalSold = "0.0";
				try {
					totalBought = oldValues.Values[0][0] as string;
					totalSold = oldValues.Values[0][1] as string;
				} catch { }

				double.TryParse(totalBought, NumberStyles.Any, CultureInfo.InvariantCulture, out var newBought);
				double.TryParse(totalSold, NumberStyles.Any, CultureInfo.InvariantCulture, out var newSold);

				newBought += data.GoldBoughtDelta;
				newSold += data.GoldSoldDelta;

				var requestBody = new ValueRange() {
					Values = new List<IList<object>>() {
						new List<object>() {
							newBought.ToString("G", System.Globalization.CultureInfo.InvariantCulture), // G
							newSold.ToString("G", System.Globalization.CultureInfo.InvariantCulture), // H
						},
					}
				};
				var request = _service.Spreadsheets.Values.Update(requestBody, _appConfig.Services.GoogleSheets.SheetId, range);
				request.ValueInputOption = SpreadsheetsResource.ValuesResource.UpdateRequest.ValueInputOptionEnum.RAW;
				request.Execute();

				return true;
			}
			catch (Exception e) {
				_logger.Error(e, $"Failed to update user {data.UserId} on Google sheets");
			}

			return false;
		}
	}
}
