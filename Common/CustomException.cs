using System;
using System.Collections.Generic;
using System.Text;

namespace Etherama.Common
{
    public class CustomException : Exception
    {

        public CustomException(string message) : base(message)
        {

        }
    }
}
