using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using System;
using System.IO.Pipes;
using System.Linq;
using System.Threading;

namespace Etherama.WebApplication {

	public class Program {

		private const string IpcPipeName = "goldmint.api.ipc";

		private static IWebHost _webHost;
		private static NamedPipeServerStream _ipcServer;
		private static object _ipcServerMonitor;

		public static void Main(string[] args) {

			if (SetupIpc(args)) {
				return;
			}

			_webHost = BuildWebHost(args);
			_webHost.Run();

			Thread.Sleep(10000);
		}

		public static IWebHost BuildWebHost(string[] args) {
			return WebHost.CreateDefaultBuilder(args)
				.UseKestrel(opts => {
					opts.AddServerHeader = false;
					opts.UseSystemd();
					opts.AllowSynchronousIO = true;
					opts.ApplicationSchedulingMode = Microsoft.AspNetCore.Server.Kestrel.Transport.Abstractions.Internal.SchedulingMode.ThreadPool;
				})
				.UseLibuv()
				.UseStartup<Startup>()
				.Build()
			;
		}

		private static bool SetupIpc(string[] args) {

			bool isClient = args.Contains("ipc-stop");
			bool isServerOptional = args.Contains("ipc-optional");

			if (!isClient) {

				try {
					_ipcServerMonitor = new object();
					_ipcServer = new NamedPipeServerStream(IpcPipeName);

					_ipcServer.BeginWaitForConnection(
						(result) => {
							_ipcServer.EndWaitForConnection(result);

							lock (_ipcServerMonitor) {
								_webHost.StopAsync();
								_webHost.WaitForShutdown();
								_ipcServer.Close();
							}
						},
						_ipcServer
					);
				}
				catch (Exception e) {
					if (!isServerOptional) {
						throw e;
					}
				}

				return false;
			}

			if (isClient) {

				try {
					using (var pipe = new NamedPipeClientStream(IpcPipeName)) {
						pipe.Connect(60000);
						pipe.ReadByte();
					}
				}
				catch { }

				return true;
			}

			return false;
		}
	}
}
