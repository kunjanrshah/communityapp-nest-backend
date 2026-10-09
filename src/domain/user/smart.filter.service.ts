import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { SearchRequestDTO } from './dto/smart.filter.dto';
import { AddrType, Prisma } from '@prisma/client';

@Injectable()
export class SmartFilterService {
  constructor(private prisma: PrismaService) {}
  //alpha
  async smartFilter(searchRequest: SearchRequestDTO) {
    const { start, length, orderByVal, alpha, filter_by } = searchRequest;

    const where: Prisma.UserWhereInput = {};

    if (filter_by) {
      if (!filter_by.role) where.status = true;

      // User Table Filters

      if (filter_by.role) where.role = filter_by.role;

      if (filter_by.id) {
        where.id = {
          equals: filter_by.id,
        };
      }

      if (filter_by.head_name) {
        where.first_name = {
          contains: filter_by.head_name,
          mode: 'insensitive',
        };
        where.head_id = 0;
      }

      if (filter_by.member_code) {
        where.member_code = {
          contains: filter_by.member_code,
          mode: 'insensitive',
        };
      }

      if (filter_by.first_name) {
        where.first_name = {
          contains: filter_by.first_name,
          mode: 'insensitive',
        };
        where.head_id = {
          not: 0,
        };
      }
      if (filter_by.father_name) {
        where.father_name = {
          contains: filter_by.father_name,
          mode: 'insensitive',
        };
      }
      if (filter_by.mother_name) {
        where.mother_name = {
          contains: filter_by.mother_name,
          mode: 'insensitive',
        };
      }

      if (filter_by.email_address) {
        where.email = {
          contains: filter_by.email_address,
          mode: 'insensitive',
        };
      }
      if (filter_by.mobile) {
        where.mobile = {
          contains: filter_by.mobile,
          mode: 'insensitive',
        };
      }

      if (filter_by.gender !== undefined) where.gender = filter_by.gender;
      if (filter_by.is_expired !== undefined) where.is_expired = filter_by.is_expired;

      if (filter_by.expire_date) {
        const dateOnly = filter_by.expire_date.split('T')[0]; // Extract YYYY-MM-DD
        where.expire_date = {
          equals: new Date(dateOnly), // Ensure Prisma compares only the date
        };
      }

      if (filter_by.updated_dt) {
        const dateOnly = filter_by.updated_dt.split('T')[0]; // Extract YYYY-MM-DD
        where.updated = {
          equals: new Date(dateOnly), // Ensure Prisma compares only the date
        };
      }

      // ✅ User Personal Details
      const userPersonalDetailFilter: Prisma.UserPersonalDetailWhereInput = {
        ...(filter_by.marital_status && {
          marital_status: filter_by.marital_status,
        }),
        ...(filter_by.birth_date && {
          birth_date: {
            equals: new Date(filter_by.birth_date.split('T')[0]),
          },
        }),
        ...(filter_by.marriage_date && {
          marriage_date: {
            equals: new Date(filter_by.marriage_date.split('T')[0]),
          },
        }),
        ...(filter_by.is_donor !== undefined && {
          is_donor: filter_by.is_donor,
        }),
        ...(filter_by.matrimony !== undefined && {
          matrimony: filter_by.matrimony,
        }),
        ...(filter_by.gotra_id && {
          gotra_id: filter_by.gotra_id,
        }),
        ...(filter_by.native_place_id && {
          native_place_id: filter_by.native_place_id,
        }),
      };

      // ✅ Add Age filters if present
      if (filter_by.min_age || filter_by.max_age) {
        const currentYear = new Date().getFullYear();
        userPersonalDetailFilter.birth_date = {
          ...(filter_by.min_age && {
            lte: new Date(currentYear - filter_by.min_age, 0, 1),
          }),
          ...(filter_by.max_age && {
            gte: new Date(currentYear - filter_by.max_age, 11, 31),
          }),
        };
      }

      // Only apply if filters exist
      if (Object.keys(userPersonalDetailFilter).length > 0) {
        where.userPersonalDetail = {
          is: userPersonalDetailFilter,
        };
      }

      // ✅ User Address Filter
      const userAddressFilter: Prisma.UserAddressWhereInput = {
        ...(filter_by.address && {
          address: {
            contains: filter_by.address,
            mode: 'insensitive',
          },
        }),
        ...(filter_by.pincode && {
          pincode: {
            contains: filter_by.pincode,
            mode: 'insensitive',
          },
        }),
        ...(filter_by.area && {
          area: {
            contains: filter_by.area,
            mode: 'insensitive',
          },
        }),
        ...(filter_by.city_id && {
          city_id: filter_by.city_id,
        }),
        ...(filter_by.state_id && {
          states_id: filter_by.state_id,
        }),
        ...(filter_by.is_rented !== undefined && {
          addr_type: filter_by.is_rented ? AddrType.RENTED : AddrType.OWN,
        }),
      };

      if (Object.keys(userAddressFilter).length > 0) {
        where.userAddress = {
          is: userAddressFilter,
        };
      }

      // ✅ User Work Detail Filter
      const userWorkDetailFilter: Prisma.UserWorkDetailWhereInput = {
        ...(filter_by.business_address && {
          business_address: {
            contains: filter_by.business_address,
            mode: 'insensitive',
          },
        }),
        ...(filter_by.business_category_id && {
          business_category_id: filter_by.business_category_id,
        }),
        ...(filter_by.committee_id && {
          committee: {
            id: filter_by.committee_id,
          },
        }),
        ...(filter_by.designation_id && {
          designation: {
            id: filter_by.designation_id,
          },
        }),
      };

      // if (filter_by.start_date || filter_by.end_date) {
      //     userWorkDetailFilter.updated = {
      //         gte: filter_by.start_date ? new Date(filter_by.start_date + '-01') : undefined,
      //         lte: filter_by.end_date ? new Date(filter_by.end_date + '-28') : undefined,
      //     };
      // }

      if (Object.keys(userWorkDetailFilter).length > 0) {
        where.userWorkDetail = {
          is: userWorkDetailFilter,
        };
      }

      // ✅ User Matrimony Filter
      const userMatrimonyFilter: Prisma.UserMatrimonyWhereInput = {
        ...(filter_by.is_mangal !== undefined && {
          is_mangal: filter_by.is_mangal,
        }),
        ...(filter_by.is_shani !== undefined && {
          is_shani: filter_by.is_shani,
        }),
        ...(filter_by.is_spect !== undefined && {
          is_spect: filter_by.is_spect,
        }),
        ...(filter_by.birth_place_id && {
          birth_place_id: filter_by.birth_place_id,
        }),
      };

      if (filter_by.min_height !== undefined || filter_by.max_height !== undefined) {
        userMatrimonyFilter.height = {
          gte: filter_by.min_height ?? undefined,
          lte: filter_by.max_height ?? undefined,
        };
      }

      if (filter_by.min_weight !== undefined || filter_by.max_weight !== undefined) {
        userMatrimonyFilter.weight = {
          gte: filter_by.min_weight ?? undefined,
          lte: filter_by.max_weight ?? undefined,
        };
      }

      if (Object.keys(userMatrimonyFilter).length > 0) {
        where.userMatrimony = {
          is: userMatrimonyFilter,
        };
      }

      // Profile Percentage Filtering
      if (filter_by.min_percentage !== undefined || filter_by.max_percentage !== undefined) {
        where.profile_percent = {
          gte: filter_by.min_percentage ?? undefined,
          lte: filter_by.max_percentage ?? undefined,
        };
      }

      // Foreign Key Filters
      if (filter_by.last_name_id) where.last_name_id = filter_by.last_name_id;
      if (filter_by.local_community_id) where.local_community_id = filter_by.local_community_id;
      if (filter_by.sub_community_id) where.sub_community_id = filter_by.sub_community_id;
      if (filter_by.occupation_id) where.occupation_id = filter_by.occupation_id;
      if (filter_by.education_id) where.education_id = filter_by.education_id;
    }

    if (alpha) {
      where.first_name = {
        startsWith: alpha,
        mode: 'insensitive',
      };
    }

    const [totalRecords, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: start,
        take: length,
        orderBy: [
          { first_name: orderByVal?.toLowerCase() === 'desc' ? 'desc' : 'asc' },
          { id: 'asc' },
        ],
        include: {
          userAddress: {
            include: {
              states: true,
              city: true,
            },
          },
          userPersonalDetail: {
            include: {
              native_place: true,
              gotra: true,
              current_activity: true,
            },
          },
          userWorkDetail: {
            include: {
              businessCategory: true,
              committee: true,
              designation: true,
            },
          },
          userMatrimony: true,
          subCast: true,
          occupation: true,
          education: true,
          relation: true,
          localCommunity: true,
          subCommunity: true,
          userLocations: true,
        },
      }),
    ]);

    return {
      members: users ?? [],
      totalRecords,
    };
  }
}
