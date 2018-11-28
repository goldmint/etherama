using AutoMapper;
using Etherama.DAL.Models;
using Etherama.WebApplication.Models.API.v1.ViewModels;

namespace Etherama.WebApplication
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            CreateMap<AddTokenRequestViewModel, AddTokenRequest>();

            CreateMap<TokenStatistics, TokenStatisticsResponseViewModel>();

            CreateMap<Token, TokenBaseInfoResponseViewModel>();

            CreateMap<Token, TokenFullInfoResponseViewModel>();
        }
    }
}
