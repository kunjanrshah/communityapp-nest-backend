import { Args, Context, Int, Query, Resolver } from '@nestjs/graphql';
import { MastersCountService } from './masters.service';
import { MastersModel } from './schema/masters.schema';
import { GetMastersResponseDTO } from './dto/model/get-masters.dto';
import { CityResponseDto } from './dto/model/getcity.dto';
import { StatisticsResponseDto } from './dto/model/statistics-response.dto';
import { StatisticsInputDto } from './dto/statistics-input.dto';
import { DateInputDto } from './dto/date-input.dto';
import { Public } from 'src/public.decorator';
import { MastersCountResponseDTO } from './dto/model/masters-count.dto';

// Masters ADD/UPDATE RESOLVER PENDING SHOULD BE WITH CURRENT DATE
@Resolver(() => MastersModel)
export class MastersResolver {
  constructor(private readonly mastersService: MastersCountService) {}

  @Query(() => MastersCountResponseDTO)
  async getMastersCounts(@Context() context): Promise<MastersCountResponseDTO> {
    return this.mastersService.getMastersCounts(context.req.user.userId);
  }

  @Public()
  @Query(() => GetMastersResponseDTO)
  async getCities(
    @Args('date', { type: () => DateInputDto, nullable: true }) date?: DateInputDto,
  ): Promise<GetMastersResponseDTO> {
    return this.mastersService.getRecords('city', date?.date);
  }

  @Public()
  @Query(() => GetMastersResponseDTO)
  async getStates(
    @Args('date', { type: () => DateInputDto, nullable: true }) date?: DateInputDto,
  ): Promise<GetMastersResponseDTO> {
    return this.mastersService.getRecords('states', date?.date);
  }

  @Query(() => GetMastersResponseDTO)
  async getBusinessCategories(
    @Args('date', { type: () => DateInputDto, nullable: true }) date?: DateInputDto,
  ): Promise<GetMastersResponseDTO> {
    return this.mastersService.getRecords('businessCategory', date?.date);
  }

  @Query(() => GetMastersResponseDTO)
  async getCurrentActivities(
    @Args('date', { type: () => DateInputDto, nullable: true }) date?: DateInputDto,
  ): Promise<GetMastersResponseDTO> {
    return this.mastersService.getRecords('currentActivity', date?.date);
  }

  @Query(() => GetMastersResponseDTO)
  async getOccupations(
    @Args('date', { type: () => DateInputDto, nullable: true }) date?: DateInputDto,
  ): Promise<GetMastersResponseDTO> {
    return this.mastersService.getRecords('occupation', date?.date);
  }

  @Query(() => GetMastersResponseDTO)
  async getCommittees(
    @Args('date', { type: () => DateInputDto, nullable: true }) date?: DateInputDto,
  ): Promise<GetMastersResponseDTO> {
    return this.mastersService.getRecords('committee', date?.date);
  }

  // NEED FOR COMMITTEEE
  @Query(() => GetMastersResponseDTO)
  async getDesignations(
    @Args('date', { type: () => DateInputDto, nullable: true }) date?: DateInputDto,
  ): Promise<GetMastersResponseDTO> {
    return this.mastersService.getRecords('designation', date?.date);
  }

  // TODO: NO NEED
  // @Query(() => GetMastersResponseDTO)
  // async getCurrentActivities(
  //   @Args('date', { nullable: true }) date?: string,
  // ): Promise<GetMastersResponseDTO> {
  //   return this.mastersService.getRecords('currentActivity', date);
  // }

  @Query(() => GetMastersResponseDTO)
  async getEducations(
    @Args('date', { type: () => DateInputDto, nullable: true }) date?: DateInputDto,
  ): Promise<GetMastersResponseDTO> {
    return this.mastersService.getRecords('education', date?.date);
  }

  @Public()
  @Query(() => GetMastersResponseDTO)
  async getSubCommunities(
    @Args('date', { type: () => DateInputDto, nullable: true }) date?: DateInputDto,
  ): Promise<GetMastersResponseDTO> {
    return this.mastersService.getRecords('subCommunity', date?.date);
  }

  @Public()
  @Query(() => GetMastersResponseDTO)
  async getLocalCommunities(
    @Args('subCommunityId', { type: () => Int, nullable: true }) subCommunityId?: number,
    @Args('date', { type: () => DateInputDto, nullable: true }) date?: DateInputDto,
  ): Promise<GetMastersResponseDTO> {
    return this.mastersService.getRecords('localCommunity', date?.date, subCommunityId);
  }

  // TODO: NO NEED
  // @Query(() => GetMastersResponseDTO)
  // async getNativePlaces(
  //   @Args('date', { nullable: true }) date?: string,
  // ): Promise<GetMastersResponseDTO> {
  //   return this.mastersService.getRecords('nativePlace', date);
  // }

  @Query(() => GetMastersResponseDTO)
  async getRelations(
    @Args('date', { type: () => DateInputDto, nullable: true }) date?: DateInputDto,
  ): Promise<GetMastersResponseDTO> {
    return this.mastersService.getRecords('relations', date?.date);
  }

  @Query(() => GetMastersResponseDTO)
  async getGotras(
    @Args('date', { type: () => DateInputDto, nullable: true }) date?: DateInputDto,
  ): Promise<GetMastersResponseDTO> {
    return this.mastersService.getRecords('gotra', date?.date);
  }

  @Public()
  @Query(() => GetMastersResponseDTO)
  async getSubCasts(
    @Args('date', { type: () => DateInputDto, nullable: true }) date?: DateInputDto,
  ): Promise<GetMastersResponseDTO> {
    return this.mastersService.getRecords('subCast', date?.date);
  }

  @Public()
  @Query(() => CityResponseDto)
  async getCitiesByState(
    @Args('stateId', { type: () => Int }) stateId: number,
    @Args('date', { type: () => String, nullable: true }) date?: string,
    @Args('subCommunityId', { type: () => Int, nullable: true }) subCommunityId?: number,
  ) {
    return this.mastersService.getCitiesByState(stateId, date, subCommunityId);
  }

  @Query(() => StatisticsResponseDto)
  async getStatistics(@Args('input') input: StatisticsInputDto): Promise<StatisticsResponseDto> {
    return this.mastersService.getStatistics(input);
  }
}
