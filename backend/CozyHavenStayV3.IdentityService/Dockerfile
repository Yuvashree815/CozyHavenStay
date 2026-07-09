FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 7101

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CozyHavenStayV3.IdentityService/CozyHavenStayV3.IdentityService.csproj", "CozyHavenStayV3.IdentityService/"]
RUN dotnet restore "CozyHavenStayV3.IdentityService/CozyHavenStayV3.IdentityService.csproj"
COPY . .
WORKDIR "/src/CozyHavenStayV3.IdentityService"
RUN dotnet build "CozyHavenStayV3.IdentityService.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CozyHavenStayV3.IdentityService.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CozyHavenStayV3.IdentityService.dll"]