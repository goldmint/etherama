using System;
using System.IO;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Etherama.DAL
{

    public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
    {
        private readonly string CONNECTION_STRING = "server=localhost;user id=etherama.io;password=etherama.io;persistsecurityinfo=True;database=etherama.io;";

        public ApplicationDbContext CreateDbContext(string[] args)
        {
            var opts = new DbContextOptionsBuilder<ApplicationDbContext>();

            opts.UseMySql(CONNECTION_STRING, myopts => {
                myopts.UseRelationalNulls(true);
            });

            var context = new ApplicationDbContext(opts.Options);

            context.Database.Migrate();

            return context;
        }

    }
}
